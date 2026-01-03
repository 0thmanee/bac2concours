/**
examine very carefuly the categories seeding, because I get no categories on the categories routes after doing all this:
@zsh (44-114) 
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hash } from "bcryptjs";
import {
  USER_ROLE,
  USER_STATUS,
  STARTUP_STATUS,
  EXPENSE_STATUS,
  UPDATE_FREQUENCY,
} from "@/lib/constants";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting comprehensive database seed...");

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log("🧹 Clearing existing data...");
  await prisma.notification.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.progressUpdate.deleteMany();
  await prisma.budgetCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.startup.deleteMany();
  await prisma.user.deleteMany();
  await prisma.incubatorSettings.deleteMany();

  // Create default incubator settings
  const settings = await prisma.incubatorSettings.create({
    data: {
      id: "1",
      incubatorName: "TechHub Incubator",
      updateFrequency: UPDATE_FREQUENCY.MONTHLY,
      autoApproveExpenses: false,
    },
  });
  console.log("✅ Created incubator settings:", settings.incubatorName);

  // Create admin user
  const adminPassword = await hash("admin123456", 12);
  const admin = await prisma.user.create({
    data: {
      email: "admin@incubationos.com",
      emailVerified: new Date(), // First user is auto-verified
      password: adminPassword,
      name: "Admin User",
      role: USER_ROLE.ADMIN,
      status: USER_STATUS.ACTIVE,
    },
  });
  console.log("✅ Created admin user:", admin.email);

  // Create global categories (used for expenses)
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Marketing",
        description: "Marketing and advertising expenses",
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: "Development",
        description: "Software development and engineering costs",
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: "Legal",
        description: "Legal consultation and compliance expenses",
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: "Operations",
        description: "General operations and overhead costs",
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: "Sales",
        description: "Sales and business development expenses",
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: "Research & Development",
        description: "R&D and innovation expenses",
        isActive: true,
      },
    }),
  ]);
  console.log("✅ Created global categories:", categories.length);

  // Create multiple founders
  const founderPassword = await hash("founder123456", 12);
  const founders = await Promise.all([
    // Founder 1 - Active, assigned to startup, verified
    prisma.user.create({
      data: {
        email: "john@techstartup.com",
        password: founderPassword,
        name: "John Doe",
        role: USER_ROLE.FOUNDER,
        status: USER_STATUS.ACTIVE,
        emailVerified: new Date(), // Verified for seed data
      },
    }),
    // Founder 2 - Active, assigned to startup, verified
    prisma.user.create({
      data: {
        email: "sarah@fintech.io",
        password: founderPassword,
        name: "Sarah Johnson",
        role: USER_ROLE.FOUNDER,
        status: USER_STATUS.ACTIVE,
        emailVerified: new Date(), // Verified for seed data
      },
    }),
    // Founder 3 - Active, assigned to startup, verified
    prisma.user.create({
      data: {
        email: "mike@healthtech.com",
        password: founderPassword,
        name: "Mike Chen",
        role: USER_ROLE.FOUNDER,
        status: USER_STATUS.ACTIVE,
        emailVerified: new Date(), // Verified for seed data
      },
    }),
    // Founder 4 - Active, assigned to startup, verified
    prisma.user.create({
      data: {
        email: "emma@edtech.com",
        password: founderPassword,
        name: "Emma Wilson",
        role: USER_ROLE.FOUNDER,
        status: USER_STATUS.ACTIVE,
        emailVerified: new Date(), // Verified for seed data
      },
    }),
    // Founder 5 - Inactive (not assigned to any startup - for testing pending page)
    // Also unverified to test verification requirement
    prisma.user.create({
      data: {
        email: "inactive@example.com",
        password: founderPassword,
        name: "Inactive Founder",
        role: USER_ROLE.FOUNDER,
        status: USER_STATUS.INACTIVE,
        emailVerified: null, // Unverified
      },
    }),
  ]);
  console.log("✅ Created founders:", founders.length);

  // Create multiple startups
  const startups = await Promise.all([
    // Startup 1 - Active, well-funded
    prisma.startup.create({
      data: {
        name: "TechStartup Inc",
        description:
          "Building innovative SaaS solutions for enterprise clients",
        industry: "Technology",
        incubationStart: new Date("2024-01-01"),
        incubationEnd: new Date("2024-12-31"),
        status: STARTUP_STATUS.ACTIVE,
        totalBudget: 100000,
        founders: {
          connect: [{ id: founders[0].id }],
        },
      },
    }),
    // Startup 2 - Active, moderate budget
    prisma.startup.create({
      data: {
        name: "FinTech Solutions",
        description: "Revolutionizing payment processing for small businesses",
        industry: "FinTech",
        incubationStart: new Date("2024-02-01"),
        incubationEnd: new Date("2025-01-31"),
        status: STARTUP_STATUS.ACTIVE,
        totalBudget: 75000,
        founders: {
          connect: [{ id: founders[1].id }],
        },
      },
    }),
    // Startup 3 - Active, smaller budget
    prisma.startup.create({
      data: {
        name: "HealthTech Innovations",
        description: "AI-powered healthcare analytics platform",
        industry: "Healthcare",
        incubationStart: new Date("2024-03-01"),
        incubationEnd: new Date("2025-02-28"),
        status: STARTUP_STATUS.ACTIVE,
        totalBudget: 60000,
        founders: {
          connect: [{ id: founders[2].id }],
        },
      },
    }),
    // Startup 4 - Inactive (for testing filters)
    prisma.startup.create({
      data: {
        name: "EduTech Platform",
        description: "Online learning platform for professional development",
        industry: "Education",
        incubationStart: new Date("2023-06-01"),
        incubationEnd: new Date("2024-05-31"),
        status: STARTUP_STATUS.INACTIVE,
        totalBudget: 50000,
        founders: {
          connect: [{ id: founders[3].id }],
        },
      },
    }),
  ]);
  console.log("✅ Created startups:", startups.length);

  // Create budget categories for each startup
  const budgetCategories = [];

  // Startup 1 categories
  const startup1Categories = await Promise.all([
    prisma.budgetCategory.create({
      data: {
        name: "Marketing",
        maxBudget: 30000,
        startupId: startups[0].id,
      },
    }),
    prisma.budgetCategory.create({
      data: {
        name: "Development",
        maxBudget: 40000,
        startupId: startups[0].id,
      },
    }),
    prisma.budgetCategory.create({
      data: {
        name: "Legal & Compliance",
        maxBudget: 15000,
        startupId: startups[0].id,
      },
    }),
    prisma.budgetCategory.create({
      data: {
        name: "Operations",
        maxBudget: 15000,
        startupId: startups[0].id,
      },
    }),
  ]);
  budgetCategories.push(...startup1Categories);

  // Startup 2 categories
  const startup2Categories = await Promise.all([
    prisma.budgetCategory.create({
      data: {
        name: "Marketing",
        maxBudget: 20000,
        startupId: startups[1].id,
      },
    }),
    prisma.budgetCategory.create({
      data: {
        name: "Development",
        maxBudget: 35000,
        startupId: startups[1].id,
      },
    }),
    prisma.budgetCategory.create({
      data: {
        name: "Legal",
        maxBudget: 10000,
        startupId: startups[1].id,
      },
    }),
    prisma.budgetCategory.create({
      data: {
        name: "Operations",
        maxBudget: 10000,
        startupId: startups[1].id,
      },
    }),
  ]);
  budgetCategories.push(...startup2Categories);

  // Startup 3 categories
  const startup3Categories = await Promise.all([
    prisma.budgetCategory.create({
      data: {
        name: "Marketing",
        maxBudget: 15000,
        startupId: startups[2].id,
      },
    }),
    prisma.budgetCategory.create({
      data: {
        name: "Development",
        maxBudget: 30000,
        startupId: startups[2].id,
      },
    }),
    prisma.budgetCategory.create({
      data: {
        name: "Legal",
        maxBudget: 8000,
        startupId: startups[2].id,
      },
    }),
    prisma.budgetCategory.create({
      data: {
        name: "Operations",
        maxBudget: 7000,
        startupId: startups[2].id,
      },
    }),
  ]);
  budgetCategories.push(...startup3Categories);

  // Startup 4 categories
  const startup4Categories = await Promise.all([
    prisma.budgetCategory.create({
      data: {
        name: "Marketing",
        maxBudget: 15000,
        startupId: startups[3].id,
      },
    }),
    prisma.budgetCategory.create({
      data: {
        name: "Development",
        maxBudget: 25000,
        startupId: startups[3].id,
      },
    }),
    prisma.budgetCategory.create({
      data: {
        name: "Legal",
        maxBudget: 5000,
        startupId: startups[3].id,
      },
    }),
    prisma.budgetCategory.create({
      data: {
        name: "Operations",
        maxBudget: 5000,
        startupId: startups[3].id,
      },
    }),
  ]);
  budgetCategories.push(...startup4Categories);

  console.log("✅ Created budget categories:", budgetCategories.length);

  // Create expenses for Startup 1 (TechStartup Inc) - John Doe
  const expenses1 = await Promise.all([
    // Approved expenses
    prisma.expense.create({
      data: {
        amount: 5000,
        description: "Google Ads Campaign - Q1 2024",
        date: new Date("2024-01-15"),
        status: EXPENSE_STATUS.APPROVED,
        categoryId: categories[0].id, // Marketing
        startupId: startups[0].id,
        submittedById: founders[0].id,
      },
    }),
    prisma.expense.create({
      data: {
        amount: 8000,
        description: "Senior Full-Stack Developer - January",
        date: new Date("2024-01-01"),
        status: EXPENSE_STATUS.APPROVED,
        categoryId: categories[1].id, // Development
        startupId: startups[0].id,
        submittedById: founders[0].id,
      },
    }),
    prisma.expense.create({
      data: {
        amount: 3500,
        description: "LinkedIn Marketing Campaign",
        date: new Date("2024-02-10"),
        status: EXPENSE_STATUS.APPROVED,
        categoryId: categories[0].id, // Marketing
        startupId: startups[0].id,
        submittedById: founders[0].id,
      },
    }),
    prisma.expense.create({
      data: {
        amount: 12000,
        description: "Backend Developer - February",
        date: new Date("2024-02-01"),
        status: EXPENSE_STATUS.APPROVED,
        categoryId: categories[1].id, // Development
        startupId: startups[0].id,
        submittedById: founders[0].id,
      },
    }),
    prisma.expense.create({
      data: {
        amount: 5000,
        description: "Corporate Legal Consultation",
        date: new Date("2024-01-20"),
        status: EXPENSE_STATUS.APPROVED,
        categoryId: categories[2].id, // Legal
        startupId: startups[0].id,
        submittedById: founders[0].id,
      },
    }),
    // Pending expenses
    prisma.expense.create({
      data: {
        amount: 7500,
        description: "Facebook Ads Campaign - March 2024",
        date: new Date("2024-03-01"),
        status: EXPENSE_STATUS.PENDING,
        categoryId: categories[0].id, // Marketing
        startupId: startups[0].id,
        submittedById: founders[0].id,
      },
    }),
    prisma.expense.create({
      data: {
        amount: 15000,
        description: "Senior DevOps Engineer - March",
        date: new Date("2024-03-01"),
        status: EXPENSE_STATUS.PENDING,
        categoryId: categories[1].id, // Development
        startupId: startups[0].id,
        submittedById: founders[0].id,
      },
    }),
    // Rejected expense
    prisma.expense.create({
      data: {
        amount: 50000,
        description: "Luxury Office Space Rental",
        date: new Date("2024-02-15"),
        status: EXPENSE_STATUS.REJECTED,
        categoryId: categories[3].id, // Operations
        startupId: startups[0].id,
        submittedById: founders[0].id,
        adminComment: "Budget exceeded. Consider co-working space instead.",
      },
    }),
  ]);

  // Create expenses for Startup 2 (FinTech Solutions) - Sarah Johnson
  const expenses2 = await Promise.all([
    prisma.expense.create({
      data: {
        amount: 4000,
        description: "Payment Gateway Integration Costs",
        date: new Date("2024-02-10"),
        status: EXPENSE_STATUS.APPROVED,
        categoryId: categories[1].id, // Development
        startupId: startups[1].id,
        submittedById: founders[1].id,
      },
    }),
    prisma.expense.create({
      data: {
        amount: 6000,
        description: "Financial Compliance Consultation",
        date: new Date("2024-02-15"),
        status: EXPENSE_STATUS.APPROVED,
        categoryId: categories[2].id, // Legal
        startupId: startups[1].id,
        submittedById: founders[1].id,
      },
    }),
    prisma.expense.create({
      data: {
        amount: 3000,
        description: "Content Marketing Campaign",
        date: new Date("2024-03-05"),
        status: EXPENSE_STATUS.PENDING,
        categoryId: categories[0].id, // Marketing
        startupId: startups[1].id,
        submittedById: founders[1].id,
      },
    }),
    prisma.expense.create({
      data: {
        amount: 25000,
        description: "Premium Office Suite",
        date: new Date("2024-02-20"),
        status: EXPENSE_STATUS.REJECTED,
        categoryId: categories[3].id, // Operations
        startupId: startups[1].id,
        submittedById: founders[1].id,
        adminComment:
          "Exceeds budget allocation. Please find more cost-effective options.",
      },
    }),
  ]);

  // Create expenses for Startup 3 (HealthTech Innovations) - Mike Chen
  const expenses3 = await Promise.all([
    prisma.expense.create({
      data: {
        amount: 5000,
        description: "Medical Data Analytics API Subscription",
        date: new Date("2024-03-01"),
        status: EXPENSE_STATUS.APPROVED,
        categoryId: categories[1].id, // Development
        startupId: startups[2].id,
        submittedById: founders[2].id,
      },
    }),
    prisma.expense.create({
      data: {
        amount: 3000,
        description: "Healthcare Compliance Review",
        date: new Date("2024-03-10"),
        status: EXPENSE_STATUS.APPROVED,
        categoryId: categories[2].id, // Legal
        startupId: startups[2].id,
        submittedById: founders[2].id,
      },
    }),
    prisma.expense.create({
      data: {
        amount: 4500,
        description: "Medical Conference Sponsorship",
        date: new Date("2024-03-15"),
        status: EXPENSE_STATUS.PENDING,
        categoryId: categories[0].id, // Marketing
        startupId: startups[2].id,
        submittedById: founders[2].id,
      },
    }),
  ]);

  // Create expenses for Startup 4 (EduTech Platform) - Emma Wilson
  const expenses4 = await Promise.all([
    prisma.expense.create({
      data: {
        amount: 3000,
        description: "Course Content Production",
        date: new Date("2023-07-01"),
        status: EXPENSE_STATUS.APPROVED,
        categoryId: categories[1].id, // Development
        startupId: startups[3].id,
        submittedById: founders[3].id,
      },
    }),
    prisma.expense.create({
      data: {
        amount: 2000,
        description: "Educational Content Marketing",
        date: new Date("2023-07-15"),
        status: EXPENSE_STATUS.APPROVED,
        categoryId: categories[0].id, // Marketing
        startupId: startups[3].id,
        submittedById: founders[3].id,
      },
    }),
  ]);

  const allExpenses = [...expenses1, ...expenses2, ...expenses3, ...expenses4];
  console.log("✅ Created expenses:", allExpenses.length);

  // Create progress updates for each startup
  const progressUpdates = await Promise.all([
    // Startup 1 - Multiple updates
    prisma.progressUpdate.create({
      data: {
        whatWasDone:
          "Completed MVP development with core features: user authentication, dashboard, and basic analytics",
        whatIsBlocked:
          "Waiting for API rate limits approval from third-party service provider",
        whatIsNext:
          "Launch beta testing program with 50 selected users and gather feedback",
        startupId: startups[0].id,
        submittedById: founders[0].id,
        createdAt: new Date("2024-01-15"),
      },
    }),
    prisma.progressUpdate.create({
      data: {
        whatWasDone:
          "Completed beta testing phase with 48 active users. Received positive feedback on UX and performance",
        whatIsBlocked:
          "Payment gateway integration delayed due to compliance review",
        whatIsNext:
          "Complete payment integration and prepare for public launch in Q2",
        startupId: startups[0].id,
        submittedById: founders[0].id,
        createdAt: new Date("2024-02-15"),
      },
    }),
    prisma.progressUpdate.create({
      data: {
        whatWasDone:
          "Successfully integrated payment gateway and completed security audit",
        whatIsBlocked: "None",
        whatIsNext:
          "Launch public beta and scale marketing efforts to reach 1000 users",
        startupId: startups[0].id,
        submittedById: founders[0].id,
        createdAt: new Date("2024-03-01"),
      },
    }),
    // Startup 2
    prisma.progressUpdate.create({
      data: {
        whatWasDone:
          "Developed core payment processing engine with support for multiple payment methods",
        whatIsBlocked:
          "Banking partnership approval taking longer than expected",
        whatIsNext:
          "Complete banking integration and start pilot program with 10 small businesses",
        startupId: startups[1].id,
        submittedById: founders[1].id,
        createdAt: new Date("2024-02-20"),
      },
    }),
    prisma.progressUpdate.create({
      data: {
        whatWasDone:
          "Launched pilot program with 8 small businesses. All payment transactions processed successfully",
        whatIsBlocked: "None",
        whatIsNext:
          "Scale to 50 businesses and improve transaction processing speed",
        startupId: startups[1].id,
        submittedById: founders[1].id,
        createdAt: new Date("2024-03-10"),
      },
    }),
    // Startup 3
    prisma.progressUpdate.create({
      data: {
        whatWasDone:
          "Built AI-powered health analytics dashboard with real-time patient data visualization",
        whatIsBlocked:
          "HIPAA compliance certification in progress, expected completion in 2 weeks",
        whatIsNext:
          "Complete compliance certification and begin clinical trials with partner hospital",
        startupId: startups[2].id,
        submittedById: founders[2].id,
        createdAt: new Date("2024-03-05"),
      },
    }),
    // Startup 4
    prisma.progressUpdate.create({
      data: {
        whatWasDone:
          "Launched online learning platform with 20 professional development courses",
        whatIsBlocked: "None",
        whatIsNext:
          "Expand course library to 50 courses and partner with industry experts",
        startupId: startups[3].id,
        submittedById: founders[3].id,
        createdAt: new Date("2023-07-01"),
      },
    }),
  ]);
  console.log("✅ Created progress updates:", progressUpdates.length);

  // Create sample notifications for admin
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        userId: admin.id,
        type: "EXPENSE_SUBMITTED",
        title: "New Expense Submitted",
        message:
          "John Doe submitted an expense of $500.00 for Marketing at TechStartup Inc",
        data: {
          startupName: "TechStartup Inc",
          amount: 500,
          category: "Marketing",
        },
        isRead: false,
        channel: "IN_APP",
        createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      },
    }),
    prisma.notification.create({
      data: {
        userId: admin.id,
        type: "NEW_USER_REGISTERED",
        title: "New User Registration",
        message:
          "A new founder Sarah Johnson has registered and is pending approval",
        data: { userName: "Sarah Johnson", userEmail: "sarah@fintech.io" },
        isRead: false,
        channel: "IN_APP",
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      },
    }),
    prisma.notification.create({
      data: {
        userId: admin.id,
        type: "PROGRESS_UPDATE_SUBMITTED",
        title: "Progress Update Submitted",
        message:
          "Mike Chen submitted a progress update for HealthTech Innovations",
        data: {
          startupName: "HealthTech Innovations",
          founderName: "Mike Chen",
        },
        isRead: false,
        channel: "IN_APP",
        createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      },
    }),
    prisma.notification.create({
      data: {
        userId: admin.id,
        type: "BUDGET_THRESHOLD_WARNING",
        title: "Budget Threshold Warning",
        message:
          "TechStartup Inc has used 85% of their monthly budget allocation",
        data: { startupName: "TechStartup Inc", percentUsed: 85 },
        isRead: true, // One read notification
        channel: "IN_APP",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      },
    }),
    prisma.notification.create({
      data: {
        userId: admin.id,
        type: "EXPENSE_SUBMITTED",
        title: "New Expense Submitted",
        message:
          "Emma Wilson submitted an expense of $1,200.00 for Development at EduTech Platform",
        data: {
          startupName: "EduTech Platform",
          amount: 1200,
          category: "Development",
        },
        isRead: false,
        channel: "IN_APP",
        createdAt: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      },
    }),
  ]);
  console.log("✅ Created notifications:", notifications.length);

  // Create notification preferences for admin
  await prisma.notificationPreference.create({
    data: {
      userId: admin.id,
      expenseUpdates: "BOTH",
      progressReminders: "BOTH",
      budgetAlerts: "BOTH",
      startupUpdates: "IN_APP",
      systemAnnouncements: "EMAIL",
    },
  });
  console.log("✅ Created notification preferences for admin");

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Login Credentials:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Admin:");
  console.log("  Email: admin@incubationos.com");
  console.log("  Password: admin123456");
  console.log("\nActive Founders (with startups assigned):");
  console.log("  1. John Doe (TechStartup Inc)");
  console.log("     Email: john@techstartup.com");
  console.log("     Password: founder123456");
  console.log("  2. Sarah Johnson (FinTech Solutions)");
  console.log("     Email: sarah@fintech.io");
  console.log("     Password: founder123456");
  console.log("  3. Mike Chen (HealthTech Innovations)");
  console.log("     Email: mike@healthtech.com");
  console.log("     Password: founder123456");
  console.log("  4. Emma Wilson (EduTech Platform)");
  console.log("     Email: emma@edtech.com");
  console.log("     Password: founder123456");
  console.log("\nInactive Founder (for testing pending page):");
  console.log("  Email: inactive@example.com");
  console.log("  Password: founder123456");
  console.log("  (Cannot login - account is inactive)");
  console.log("\n📊 Seed Summary:");
  console.log(`  - Startups: ${startups.length} (3 active, 1 inactive)`);
  console.log(`  - Founders: ${founders.length} (4 active, 1 inactive)`);
  console.log(`  - Budget Categories: ${budgetCategories.length}`);
  console.log(`  - Expenses: ${allExpenses.length} (mixed statuses)`);
  console.log(`  - Progress Updates: ${progressUpdates.length}`);
  console.log(`  - Notifications: ${notifications.length} (for admin)`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
