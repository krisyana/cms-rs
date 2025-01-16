import { Unit, Jabatan, LoginHistory } from "./index"; // Adjust the import path
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
    // Seed the admin user with password 'admin'
    const hashedAdminPassword = await bcrypt.hash("admin", 10);

    // Fetch all Jabatans
    const jabatans = await Jabatan.findAll();
    // // Create Admin Unit
    // await Unit.create({
    //   nama: "Admin User",
    //   username: "admin",
    //   password: hashedAdminPassword,
    //   unit: "Admin Unit",
    //   jabatan: "admin",
    //   tanggalBergabung: new Date(),
    // });
    const units: any[] = []; // Hold all created units for easy access
    // Create random Units
    for (let i = 0; i < 20; i++) {
      const randomJabatans = faker.helpers.arrayElements(
        jabatans.map((j) => j.nama),
        faker.number.int({ min: 1, max: 3 })
      );

      let unit = await Unit.create({
        nama: faker.person.fullName(),
        username: faker.internet.username(),
        password: await bcrypt.hash("password", 10),
        unit: faker.company.name(),
        jabatan: randomJabatans,
        tanggalBergabung: faker.date.past(),
      });
      // Store the created unit
      units.push(unit);
    }

    // Add 200 login history records
    const totalLoginHistories = 200;
    for (let i = 0; i < totalLoginHistories; i++) {
      const randomUnit = faker.helpers.arrayElement(units); // Random unit for each login history
      await LoginHistory.create({
        unitId: randomUnit.id,
        loginAt: faker.date.past(), // Random login date
      });
    }
    console.log("Seeding completed!");
  } catch (err) {
    console.error("Error during seeding:", err);
  }
};
