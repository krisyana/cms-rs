import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import {
  Sequelize,
  DataTypes,
  Model,
  Op,
  BelongsToManySetAssociationsMixin,
} from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { seedData } from "./seeding";
import "dotenv/config";
import cors from "cors";

// Initialize Express app
const app = express();
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*", // Allows all origins (you can restrict this to specific domains if needed)
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);

// Initialize Sequelize
const sequelize = new Sequelize(
  process.env.DB || "mysql://root:@localhost:3306/cms"
);

// Models
export class Unit extends Model {
  public nama!: string;
}

Unit.init(
  {
    nama: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  { sequelize, modelName: "Unit" }
);

// Jabatan Model
export class Jabatan extends Model {
  public nama!: string;
}

Jabatan.init(
  {
    nama: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  { sequelize, modelName: "Jabatan" }
);

// Employee Model
export class Employee extends Model {
  public id!: string;
  public nama!: string;
  public username!: string;
  public password!: string;
  public unitName!: string;
  public tanggalBergabung!: Date;
  public setJabatans!: BelongsToManySetAssociationsMixin<Jabatan, number>;
}

Employee.init(
  {
    nama: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    unitName: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "Units", key: "nama" },
    },
    tanggalBergabung: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, modelName: "Employee" }
);

// Define associations
Unit.hasMany(Employee, { foreignKey: "unitName", as: "employees" });
Employee.belongsTo(Unit, { foreignKey: "unitName", as: "unit" });

Employee.belongsToMany(Jabatan, {
  through: "EmployeeJabatan",
  foreignKey: "employeeId",
  otherKey: "jabatanNama",
  as: "jabatans",
});
Jabatan.belongsToMany(Employee, {
  through: "EmployeeJabatan",
  foreignKey: "jabatanNama",
  otherKey: "employeeId",
  as: "employees",
});

export class LoginHistory extends Model {
  public id!: number;
  public username!: string;
  public loginAt!: Date;
}

LoginHistory.init(
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "Employees", key: "username" },
    },
    loginAt: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, modelName: "LoginHistory" }
);

LoginHistory.belongsTo(Employee, { foreignKey: "username", as: "employee" });

// Sync database
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database synced!");
    if (process.env.USE_SEEDING === "true") {
      seedData();
    }
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
  });

// Middleware for authentication
const authenticateToken = (req: Request, res: Response, next: Function) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const verified = jwt.verify(token.split(" ")[1], "SECRET_KEY");
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

// Routes

// Login
app.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const employee = await Employee.findOne({ where: { username } });

  if (!employee) return res.status(404).json({ message: "User not found" });

  const validPassword = await bcrypt.compare(password, employee.password);
  console.log(validPassword);
  if (!validPassword)
    return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { nama: employee.nama, username: employee.username },
    "SECRET_KEY",
    { expiresIn: "1h" }
  );

  // Save the login history
  await LoginHistory.create({
    username: employee.username,
    loginAt: new Date(),
  });

  res.json({ token });
});

// CRUD for Employee
app.post(
  "/employees",
  authenticateToken,
  async (req: Request, res: Response) => {
    const { nama, username, password, unitName, jabatan, tanggalBergabung } =
      req.body;

    try {
      // Validate Unit
      const unit = await Unit.findOne({ where: { nama: unitName } });
      if (!unit) Unit.create({ nama: unitName });

      // Hash Password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create Employee
      const newEmployee = await Employee.create({
        nama,
        username,
        password: hashedPassword,
        unitName,
        tanggalBergabung,
      });

      // Associate Jabatans
      if (jabatan && jabatan.length > 0) {
        const jabatans = await Jabatan.findAll({ where: { nama: jabatan } });
        if (jabatans.length !== jabatan.length) {
          return res
            .status(400)
            .json({ message: "Some jabatan names are invalid" });
        }
        const resp = await newEmployee.setJabatans(jabatans);
        console.log(resp);
      }

      // Include associations in the response
      const employeeWithAssociations = await Employee.findByPk(newEmployee.id, {
        include: [
          { model: Unit, as: "unit" },
          { model: Jabatan, as: "jabatans" },
        ],
      });
      console.log(employeeWithAssociations);
      res.status(201).json(employeeWithAssociations);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
);

// GET /employees - Get all employees with associations
app.get(
  "/employees",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const employees = await Employee.findAll({
        include: [
          { model: Unit, as: "unit" },
          { model: Jabatan, as: "jabatans" },
        ],
      });
      res.json(employees);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);

// GET /employees/:id - Get a specific employee with associations
app.get(
  "/employees/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const employee = await Employee.findByPk(req.params.id, {
        include: [
          { model: Unit, as: "unit" },
          { model: Jabatan, as: "jabatans" },
        ],
      });
      if (!employee)
        return res.status(404).json({ message: "Employee not found" });
      res.json(employee);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);

// PUT /employees/:id - Update an employee with associations
app.put(
  "/employees/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    const {
      id,
      nama,
      username,
      password,
      unitName,
      jabatan,
      tanggalBergabung,
    } = req.body;

    try {
      // Find Employee
      const employeeToUpdate = await Employee.findByPk(req.params.id);
      if (!employeeToUpdate)
        return res.status(404).json({ message: "Employee not found" });

      // Validate Unit
      if (unitName) {
        const unit = await Unit.findOne({ where: { nama: unitName } });
        if (!unit) return res.status(400).json({ message: "Invalid unitName" });
      }

      // Update Employee
      const hashedPassword = password
        ? await bcrypt.hash(password, 10)
        : employeeToUpdate.password;

      await employeeToUpdate.update({
        nama,
        username,
        password: hashedPassword,
        unitName,
        tanggalBergabung,
      });

      // Update Jabatans
      if (jabatan) {
        const jabatans = await Jabatan.findAll({ where: { nama: jabatan } });
        if (jabatans.length !== jabatan.length) {
          return res
            .status(400)
            .json({ message: "Some jabatan names are invalid" });
        }
        await employeeToUpdate.setJabatans(jabatans);
      }

      // Include associations in the response
      const updatedEmployee = await Employee.findByPk(id, {
        include: [
          { model: Unit, as: "unit" },
          { model: Jabatan, as: "jabatans" },
        ],
      });

      res.json(updatedEmployee);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
);

// DELETE /employees/:id - Delete an employee
app.delete(
  "/employees/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const employeeToDelete = await Employee.findByPk(req.params.id);
      if (!employeeToDelete)
        return res.status(404).json({ message: "Employee not found" });

      await employeeToDelete.destroy();
      res.json({ message: "Employee deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);

// CRUD for Jabatan
app.post("/jabatan", authenticateToken, async (req: Request, res: Response) => {
  const { nama } = req.body;
  try {
    const newJabatan = await Jabatan.create({ nama });
    res.status(201).json(newJabatan);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/jabatan", authenticateToken, async (req: Request, res: Response) => {
  const jabatans = await Jabatan.findAll();
  res.json(jabatans);
});

app.get(
  "/jabatan/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    const jabatan = await Jabatan.findByPk(req.params.id);
    if (!jabatan) return res.status(404).json({ message: "Jabatan not found" });
    res.json(jabatan);
  }
);

app.put(
  "/jabatan/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    const { nama } = req.body;
    const jabatanToUpdate = await Jabatan.findByPk(req.params.id);

    if (!jabatanToUpdate)
      return res.status(404).json({ message: "Jabatan not found" });

    try {
      await jabatanToUpdate.update({ nama });
      res.json(jabatanToUpdate);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
);

app.delete(
  "/jabatan/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    const jabatanToDelete = await Jabatan.findByPk(req.params.id);
    if (!jabatanToDelete)
      return res.status(404).json({ message: "Jabatan not found" });

    await jabatanToDelete.destroy();
    res.json({ message: "Jabatan deleted successfully" });
  }
);

app.post("/units", async (req, res) => {
  try {
    const { nama } = req.body;
    if (!nama) {
      return res.status(400).json({ error: "Name is required" });
    }
    const unit = await Unit.create({ nama });
    res.status(201).json(unit);
  } catch (error) {
    console.error("Error creating unit:", error);
    res.status(500).json({ error: "Failed to create unit" });
  }
});

// Get all Units
app.get("/units", authenticateToken, async (req, res) => {
  try {
    const units = await Unit.findAll();
    res.status(200).json(units);
  } catch (error) {
    console.error("Error retrieving units:", error);
    res.status(500).json({ error: "Failed to retrieve units" });
  }
});

// Get a single Unit by ID
app.get("/units/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const unit = await Unit.findByPk(id, { include: "employees" }); // Include associated employees
    if (!unit) {
      return res.status(404).json({ error: "Unit not found" });
    }
    res.status(200).json(unit);
  } catch (error) {
    console.error("Error retrieving unit:", error);
    res.status(500).json({ error: "Failed to retrieve unit" });
  }
});

// Update a Unit
app.put("/units/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nama } = req.body;
    const unit = await Unit.findByPk(id);
    if (!unit) {
      return res.status(404).json({ error: "Unit not found" });
    }
    if (nama) unit.nama = nama;
    await unit.save();
    res.status(200).json(unit);
  } catch (error) {
    console.error("Error updating unit:", error);
    res.status(500).json({ error: "Failed to update unit" });
  }
});

// Delete a Unit
app.delete("/units/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const unit = await Unit.findByPk(id);
    if (!unit) {
      return res.status(404).json({ error: "Unit not found" });
    }
    await unit.destroy();
    res.status(204).send(); // No content response
  } catch (error) {
    console.error("Error deleting unit:", error);
    res.status(500).json({ error: "Failed to delete unit" });
  }
});

// endpoint to display the requested statistics
app.get("/stats", authenticateToken, async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query; // Time filter parameters (optional)

  try {
    // Size of Unit
    const unitCount = await Unit.count();

    // Size of Jabatan
    const jabatanCount = await Jabatan.count();

    // Top 10 users who logged in more than 25 times with optional time filter
    const loginHistoryQuery: any = {
      attributes: [
        [sequelize.col("LoginHistory.username"), "username"],
        [
          sequelize.fn("COUNT", sequelize.col("LoginHistory.username")),
          "loginCount",
        ],
      ],
      group: ["LoginHistory.username"],
      having: sequelize.where(
        sequelize.fn("COUNT", sequelize.col("LoginHistory.username")),
        {
          [Op.gt]: 25,
        }
      ),
      order: [
        [sequelize.fn("COUNT", sequelize.col("LoginHistory.username")), "DESC"],
      ],
      limit: 10,
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["nama"],
        },
      ],
    };

    if (startDate && endDate) {
      loginHistoryQuery.where = {
        loginAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      };
    }
    const loginCountQuery = {
      where: {},
    };
    if (startDate && endDate) {
      loginCountQuery.where = {
        loginAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      };
    }

    const employeeCountQuery = {
      where: {},
    };
    if (startDate && endDate) {
      employeeCountQuery.where = {
        tanggalBergabung: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      };
    }
    const loginCount = await LoginHistory.count(loginCountQuery);

    // size of login
    const topLoginUsers = await LoginHistory.findAll(loginHistoryQuery);

    // Size of Employee
    const employeeCount = await Employee.count(employeeCountQuery);

    // Prepare response data
    const responseData = {
      employeeCount,
      unitCount,
      jabatanCount,
      loginCount,
      topLoginUsers: topLoginUsers.map((entry) => ({
        username: entry.username,
        loginCount: entry.get("loginCount"),
      })),
    };

    res.json(responseData);
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ message: "Error fetching stats" });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(process.env.USE_SEEDING, "Seed");
  console.log(`Server is running on http://localhost:${PORT}`);
});
