import { Employee, Jabatan, Unit, LoginHistory } from "./index"; // Adjust the import path
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

export const seedData = async () => {
  try {
    // Create random Jabatans
    for (let i = 0; i < 10; i++) {
      await Jabatan.create({
        nama: faker.person.jobTitle(),
      });
    }

    // Create random Units
    for (let i = 0; i < 5; i++) {
      await Unit.create({
        nama: faker.company.name(),
        lokasi: faker.address.city(),
      });
    }

    // Seed the admin user with password 'admin'
    const hashedAdminPassword = await bcrypt.hash("admin", 10);

    // Fetch all Jabatans
    const jabatans = await Jabatan.findAll();
    const units = await Unit.findAll(); // Fetch all units

    // Find admin employee
    const admin = await Employee.findOne({ where: { username: "admin" } });

    // Create Admin Employee if not admin
    if (!admin) {
      await Employee.create({
        nama: "Admin User",
        username: "admin",
        password: hashedAdminPassword,
        unitName: units[0].nama,
        jabatan: [jabatans[0], jabatans[1]],
        tanggalBergabung: new Date(),
      });
    }

    // Create random Employees and assign them to random units and jabatans
    const createdEmployees: any[] = []; // Hold all created employees for easy access
    for (let i = 0; i < 10; i++) {
      const randomJabatans = faker.helpers.arrayElements(jabatans);

      const randomUnit = faker.helpers.arrayElement(units); // Random unit for each employee

      let employee = await Employee.create({
        nama: faker.person.fullName(),
        username: faker.internet.username(),
        password: await bcrypt.hash("password", 10),
        unitName: randomUnit.nama,
        jabatan: randomJabatans,
        tanggalBergabung: faker.date.past(),
      });
      await employee.setJabatans(randomJabatans);

      // Store the created employee
      createdEmployees.push(employee);
    }

    // Add 200 login history records
    const totalLoginHistories = 200;
    for (let i = 0; i < totalLoginHistories; i++) {
      const randomEmployee = faker.helpers.arrayElement(createdEmployees); // Random employee for each login history
      await LoginHistory.create({
        username: randomEmployee.username,
        loginAt: faker.date.past(), // Random login date
      });
    }

    console.log("Seeding completed!");
  } catch (err) {
    console.error("Error during seeding:", err);
  }
};
