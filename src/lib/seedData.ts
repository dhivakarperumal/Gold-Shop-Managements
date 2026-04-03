import { db } from './db';

const initialCustomers = [
  {
    customerId: "CUST-0001",
    name: "Ravi Kumar",
    mobile: "9876543210",
    altPhone: "9123456780",
    email: "ravi@gmail.com",
    aadharNo: "123412341234",
    panNo: "ABCDE1234F",
    kycStatus: "Verified",
    city: "Chennai",
    state: "Tamil Nadu",
    occupation: "Gold Trader",
    monthlyIncome: 50000,
    amountActive: 250000
  },
  {
    customerId: "CUST-0002",
    name: "Suresh Babu",
    mobile: "9988776655",
    altPhone: "",
    email: "suresh@gmail.com",
    aadharNo: "234523452345",
    panNo: "BCDEA2345G",
    kycStatus: "Pending",
    city: "Madurai",
    state: "Tamil Nadu",
    occupation: "Farmer",
    monthlyIncome: 30000,
    amountActive: 120000
  },
  {
    customerId: "CUST-0003",
    name: "Priya Sharma",
    mobile: "9090909090",
    altPhone: "8080808080",
    email: "priya@gmail.com",
    aadharNo: "345634563456",
    panNo: "CDEAB3456H",
    kycStatus: "Verified",
    city: "Coimbatore",
    state: "Tamil Nadu",
    occupation: "Teacher",
    monthlyIncome: 40000,
    amountActive: 90000
  },
  {
    customerId: "CUST-0004",
    name: "Arun Raj",
    mobile: "9871234567",
    altPhone: "",
    email: "arun@gmail.com",
    aadharNo: "456745674567",
    panNo: "DEABC4567I",
    kycStatus: "Rejected",
    city: "Salem",
    state: "Tamil Nadu",
    occupation: "Driver",
    monthlyIncome: 20000,
    amountActive: 50000
  },
  {
    customerId: "CUST-0005",
    name: "Meena Lakshmi",
    mobile: "9012345678",
    altPhone: "",
    email: "meena@gmail.com",
    aadharNo: "567856785678",
    panNo: "EABCD5678J",
    kycStatus: "Verified",
    city: "Trichy",
    state: "Tamil Nadu",
    occupation: "Business",
    monthlyIncome: 60000,
    amountActive: 300000
  },
  {
    customerId: "CUST-0006",
    name: "Karthik",
    mobile: "9898989898",
    altPhone: "",
    email: "karthik@gmail.com",
    aadharNo: "678967896789",
    panNo: "ABCDE6789K",
    kycStatus: "Pending",
    city: "Erode",
    state: "Tamil Nadu",
    occupation: "Engineer",
    monthlyIncome: 70000,
    amountActive: 180000
  },
  {
    customerId: "CUST-0007",
    name: "Divya",
    mobile: "9123456789",
    altPhone: "",
    email: "divya@gmail.com",
    aadharNo: "789078907890",
    panNo: "BCDEA7890L",
    kycStatus: "Verified",
    city: "Vellore",
    state: "Tamil Nadu",
    occupation: "Nurse",
    monthlyIncome: 35000,
    amountActive: 80000
  },
  {
    customerId: "CUST-0008",
    name: "Manoj",
    mobile: "9345678901",
    altPhone: "",
    email: "manoj@gmail.com",
    aadharNo: "890189018901",
    panNo: "CDEAB8901M",
    kycStatus: "Pending",
    city: "Tirunelveli",
    state: "Tamil Nadu",
    occupation: "Shop Owner",
    monthlyIncome: 45000,
    amountActive: 150000
  },
  {
    customerId: "CUST-0009",
    name: "Anitha",
    mobile: "9456789012",
    altPhone: "",
    email: "anitha@gmail.com",
    aadharNo: "901290129012",
    panNo: "DEABC9012N",
    kycStatus: "Verified",
    city: "Thanjavur",
    state: "Tamil Nadu",
    occupation: "Teacher",
    monthlyIncome: 38000,
    amountActive: 95000
  },
  {
    customerId: "CUST-0010",
    name: "Rajesh",
    mobile: "9567890123",
    altPhone: "",
    email: "rajesh@gmail.com",
    aadharNo: "012301230123",
    panNo: "EABCD0123O",
    kycStatus: "Rejected",
    city: "Chennai",
    state: "Tamil Nadu",
    occupation: "Driver",
    monthlyIncome: 25000,
    amountActive: 60000
  }
];

export const seedCustomers = async () => {
  const existing = await db.get('customers');
  if (existing.length > 0) {
    console.log('Database already has customers. Skipping seed.');
    return;
  }
  
  console.log('Seeding initial customers...');
  for (const customer of initialCustomers) {
    await db.add('customers', {
      ...customer,
      createdAt: new Date().toISOString()
    });
  }
  console.log('Seeding complete.');
};
