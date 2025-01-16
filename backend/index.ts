import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { Sequelize, DataTypes, Model, Op } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { seedData } from "./seeding";
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
const sequelize = new Sequelize("mysql://root:@localhost:3306/cms");

// Models
export class Unit extends Model {
  public id!: number;
  public username!: string;
  public password!: string;
  public nama!: string;
  public unit!: string;
  public jabatan!: object;
  public tanggalBergabung!: Date;
}

Unit.init(
  {
    nama: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    unit: { type: DataTypes.STRING, allowNull: false },
    jabatan: { type: DataTypes.JSON, allowNull: false },
    tanggalBergabung: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, modelName: "Unit" }
);

// Jabatan Model
export class Jabatan extends Model {
  public id!: number;
  public nama!: string;
}

Jabatan.init(
  {
    nama: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize, modelName: "Jabatan" }
);

export class LoginHistory extends Model {
  public id!: number;
  public unitId!: number;
  public loginAt!: Date;
}

LoginHistory.init(
  {
    unitId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Units", key: "id" },
    },
    loginAt: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, modelName: "LoginHistory" }
);

// seedData();

// Sync database
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database synced!");
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
  const unit = await Unit.findOne({ where: { username } });

  if (!unit) return res.status(404).json({ message: "User not found" });

  const validPassword = await bcrypt.compare(password, unit.password);
  console.log(validPassword);
  if (!validPassword)
    return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: unit.id, username: unit.username },
    "SECRET_KEY",
    { expiresIn: "1h" }
  );

  // Save the login history
  await LoginHistory.create({
    unitId: unit.id,
    loginAt: new Date(),
  });

  res.json({ token });
});

// CRUD for Unit
app.post("/units", authenticateToken, async (req: Request, res: Response) => {
  const { nama, username, password, unit, jabatan, tanggalBergabung } =
    req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUnit = await Unit.create({
      nama,
      username,
      password: hashedPassword,
      unit,
      jabatan,
      tanggalBergabung,
    });
    res.status(201).json(newUnit);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/units", authenticateToken, async (req: Request, res: Response) => {
  const units = await Unit.findAll();
  res.json(units);
});

app.get(
  "/units/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    const unit = await Unit.findByPk(req.params.id);
    if (!unit) return res.status(404).json({ message: "Unit not found" });
    res.json(unit);
  }
);

app.put(
  "/units/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    const { nama, username, password, unit, jabatan, tanggalBergabung } =
      req.body;
    const unitToUpdate = await Unit.findByPk(req.params.id);

    if (!unitToUpdate)
      return res.status(404).json({ message: "Unit not found" });

    try {
      const hashedPassword = password
        ? await bcrypt.hash(password, 10)
        : unitToUpdate.password;
      await unitToUpdate.update({
        nama,
        username,
        password: hashedPassword,
        unit,
        jabatan,
        tanggalBergabung,
      });
      res.json(unitToUpdate);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
);

app.delete(
  "/units/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    const unitToDelete = await Unit.findByPk(req.params.id);
    if (!unitToDelete)
      return res.status(404).json({ message: "Unit not found" });

    await unitToDelete.destroy();
    res.json({ message: "Unit deleted successfully" });
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

// endpoint to display the requested statistics
app.get("/stats", authenticateToken, async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query; // Time filter parameters (optional)

  try {
    // Size of Units
    const unitCount = await Unit.count();

    // Size of Jabatan
    const jabatanCount = await Jabatan.count();

    // Top 10 users who logged in more than 25 times with optional time filter
    const loginHistoryQuery: any = {
      attributes: [
        "unitId",
        [sequelize.fn("COUNT", sequelize.col("unitId")), "loginCount"],
      ],
      group: ["unitId"],
      having: sequelize.where(sequelize.fn("COUNT", sequelize.col("unitId")), {
        [Op.gt]: 25,
      }), // Only units with more than 25 logins
      order: [[sequelize.fn("COUNT", sequelize.col("unitId")), "DESC"]],
      limit: 10,
    };

    if (startDate && endDate) {
      loginHistoryQuery.where = {
        loginAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      };
    }

    const topLoginUsers = await LoginHistory.findAll(loginHistoryQuery);

    // Prepare response data
    const responseData = {
      unitCount,
      jabatanCount,
      topLoginUsers: topLoginUsers.map((entry) => ({
        unitId: entry.unitId,
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
  console.log(`Server is running on http://localhost:${PORT}`);
});
