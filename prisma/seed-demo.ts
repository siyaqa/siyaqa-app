import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Preparation des donnees de demo...\n");

  const hashedPassword = await bcrypt.hash("siyaqi2026", 10);

  // ============================================
  // AUTO-ECOLE
  // ============================================
  const ecole = await prisma.autoEcole.upsert({
    where: { id: "demo-ecole" },
    update: {},
    create: {
      id: "demo-ecole",
      name: "Auto-Ecole Al Najah",
      city: "Casablanca",
      address: "45, Bd Mohammed V, Maarif",
      phone: "0522-234567",
      trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  // ============================================
  // GERANT
  // ============================================
  const gerant = await prisma.user.upsert({
    where: { username: "gerant" },
    update: {},
    create: {
      username: "gerant",
      hashedPassword,
      fullName: "Mohammed Mansouri",
      role: "GERANT",
      phone: "0661-234567",
      autoEcoleId: ecole.id,
    },
  });

  // ============================================
  // MONITEURS
  // ============================================
  const moniteur1 = await prisma.user.upsert({
    where: { username: "rachid.m" },
    update: {},
    create: {
      username: "rachid.m",
      hashedPassword,
      fullName: "Rachid Benali",
      role: "MONITEUR",
      phone: "0671-112233",
      autoEcoleId: ecole.id,
    },
  });

  const moniteur2 = await prisma.user.upsert({
    where: { username: "hassan.k" },
    update: {},
    create: {
      username: "hassan.k",
      hashedPassword,
      fullName: "Hassan Karimi",
      role: "MONITEUR",
      phone: "0672-445566",
      autoEcoleId: ecole.id,
    },
  });

  const moniteur3 = await prisma.user.upsert({
    where: { username: "fatima.z" },
    update: {},
    create: {
      username: "fatima.z",
      hashedPassword,
      fullName: "Fatima Zahra Idrissi",
      role: "MONITEUR",
      phone: "0673-778899",
      autoEcoleId: ecole.id,
    },
  });

  const moniteurs = [moniteur1, moniteur2, moniteur3];

  // ============================================
  // CANDIDATS (22 candidats realistes)
  // ============================================
  const candidatesData = [
    { firstName: "Youssef",    lastName: "El Amrani",    phone: "0661-001122", cin: "BH482910", gender: "MALE" as const,   permitType: "B" as const,  status: "CONDUITE_EN_COURS" as const, totalFee: 4500, birthDate: new Date("2003-03-15") },
    { firstName: "Salma",      lastName: "Benjelloun",   phone: "0662-334455", cin: "BE891234", gender: "FEMALE" as const, permitType: "B" as const,  status: "CODE_EN_COURS" as const,     totalFee: 4000, birthDate: new Date("2005-07-22") },
    { firstName: "Omar",       lastName: "Tazi",         phone: "0663-556677", cin: "BK172839", gender: "MALE" as const,   permitType: "B" as const,  status: "PERMIS_OBTENU" as const,     totalFee: 4500, birthDate: new Date("2001-11-08") },
    { firstName: "Khadija",    lastName: "Ouazzani",     phone: "0664-778899", cin: "BJ564738", gender: "FEMALE" as const, permitType: "B" as const,  status: "CONDUITE_EN_COURS" as const, totalFee: 4000, birthDate: new Date("2004-01-30") },
    { firstName: "Mehdi",      lastName: "Chraibi",      phone: "0665-990011", cin: "BH928374", gender: "MALE" as const,   permitType: "C" as const,  status: "CODE_EN_COURS" as const,     totalFee: 6000, birthDate: new Date("1998-05-12") },
    { firstName: "Imane",      lastName: "Fassi Fihri",  phone: "0666-112233", cin: "BA746352", gender: "FEMALE" as const, permitType: "B" as const,  status: "CODE_REUSSI" as const,       totalFee: 4500, birthDate: new Date("2002-09-25") },
    { firstName: "Amine",      lastName: "Berrada",      phone: "0667-334455", cin: "BK839201", gender: "MALE" as const,   permitType: "B" as const,  status: "EXAMEN_PLANIFIE" as const,   totalFee: 4500, birthDate: new Date("2000-12-03") },
    { firstName: "Houda",      lastName: "Kettani",      phone: "0668-556677", cin: "BE473829", gender: "FEMALE" as const, permitType: "B" as const,  status: "CONDUITE_EN_COURS" as const, totalFee: 4000, birthDate: new Date("2003-06-18") },
    { firstName: "Adil",       lastName: "Lahlou",       phone: "0669-778899", cin: "BH192837", gender: "MALE" as const,   permitType: "A" as const,  status: "CODE_EN_COURS" as const,     totalFee: 3000, birthDate: new Date("1999-08-07") },
    { firstName: "Nadia",      lastName: "Alaoui",       phone: "0670-990011", cin: "BJ384756", gender: "FEMALE" as const, permitType: "B" as const,  status: "PERMIS_OBTENU" as const,     totalFee: 4500, birthDate: new Date("2001-02-14") },
    { firstName: "Hamza",      lastName: "Sqalli",       phone: "0671-112244", cin: "BA657483", gender: "MALE" as const,   permitType: "B" as const,  status: "CONDUITE_EN_COURS" as const, totalFee: 4500, birthDate: new Date("2004-04-20") },
    { firstName: "Sara",       lastName: "Bennani",      phone: "0672-334466", cin: "BK918273", gender: "FEMALE" as const, permitType: "B" as const,  status: "CODE_EN_COURS" as const,     totalFee: 4000, birthDate: new Date("2005-10-11") },
    { firstName: "Zakaria",    lastName: "Mouline",      phone: "0673-556688", cin: "BE746382", gender: "MALE" as const,   permitType: "EC" as const, status: "CODE_REUSSI" as const,       totalFee: 7000, birthDate: new Date("1996-07-09") },
    { firstName: "Meryem",     lastName: "Hajji",        phone: "0674-778800", cin: "BH283946", gender: "FEMALE" as const, permitType: "B" as const,  status: "CONDUITE_EN_COURS" as const, totalFee: 4500, birthDate: new Date("2003-03-01") },
    { firstName: "Rachid",     lastName: "El Idrissi",   phone: "0675-990022", cin: "BJ536271", gender: "MALE" as const,   permitType: "D" as const,  status: "CODE_EN_COURS" as const,     totalFee: 8000, birthDate: new Date("1995-11-28") },
    { firstName: "Fatima",     lastName: "Bouzid",       phone: "0676-112255", cin: "BA829374", gender: "FEMALE" as const, permitType: "B" as const,  status: "ABANDONNE" as const,         totalFee: 4000, birthDate: new Date("2002-08-16") },
    { firstName: "Khalid",     lastName: "Naciri",       phone: "0677-334477", cin: "BK473829", gender: "MALE" as const,   permitType: "B" as const,  status: "CONDUITE_EN_COURS" as const, totalFee: 4500, birthDate: new Date("2000-06-05") },
    { firstName: "Amina",      lastName: "Slaoui",       phone: "0678-556699", cin: "BE192834", gender: "FEMALE" as const, permitType: "B" as const,  status: "EXAMEN_PLANIFIE" as const,   totalFee: 4500, birthDate: new Date("2001-12-22") },
    { firstName: "Soufiane",   lastName: "Guessous",     phone: "0679-778811", cin: "BH746352", gender: "MALE" as const,   permitType: "B" as const,  status: "CODE_REUSSI" as const,       totalFee: 4000, birthDate: new Date("2004-09-13") },
    { firstName: "Rim",        lastName: "Tahiri",       phone: "0680-990033", cin: "BJ829374", gender: "FEMALE" as const, permitType: "B" as const,  status: "CODE_EN_COURS" as const,     totalFee: 4500, birthDate: new Date("2005-01-07") },
    { firstName: "Karim",      lastName: "Benkirane",    phone: "0681-112266", cin: "BA384756", gender: "MALE" as const,   permitType: "B" as const,  status: "CONDUITE_EN_COURS" as const, totalFee: 4500, birthDate: new Date("2002-05-30") },
    { firstName: "Leila",      lastName: "Zniber",       phone: "0682-334488", cin: "BK657483", gender: "FEMALE" as const, permitType: "B" as const,  status: "CODE_EN_COURS" as const,     totalFee: 4000, birthDate: new Date("2006-02-19") },
  ];

  const candidates = [];
  for (const c of candidatesData) {
    const candidate = await prisma.candidate.create({
      data: {
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone,
        cin: c.cin,
        gender: c.gender,
        permitType: c.permitType,
        status: c.status,
        totalFee: c.totalFee,
        birthDate: c.birthDate,
        autoEcoleId: ecole.id,
      },
    });
    candidates.push(candidate);
  }
  console.log(`${candidates.length} candidats crees`);

  // ============================================
  // PAIEMENTS (realistes, varies)
  // ============================================
  const paymentData: { candidateIndex: number; amounts: number[]; methods: ("CASH" | "VIREMENT" | "CHEQUE")[]; dates: string[]; notes: string[] }[] = [
    // Youssef — 3 paiements, presque solde
    { candidateIndex: 0, amounts: [2000, 1500, 500], methods: ["CASH", "CASH", "VIREMENT"], dates: ["2026-04-10", "2026-05-05", "2026-06-01"], notes: ["Inscription", "2eme versement", "3eme versement"] },
    // Salma — 1 paiement
    { candidateIndex: 1, amounts: [2000], methods: ["CASH"], dates: ["2026-06-15"], notes: ["Inscription"] },
    // Omar — tout paye (permis obtenu)
    { candidateIndex: 2, amounts: [2000, 1500, 1000], methods: ["CASH", "VIREMENT", "CASH"], dates: ["2026-02-01", "2026-03-10", "2026-04-20"], notes: ["Inscription", "2eme versement", "Solde"] },
    // Khadija — 2 paiements
    { candidateIndex: 3, amounts: [2000, 1000], methods: ["CASH", "CHEQUE"], dates: ["2026-05-01", "2026-06-10"], notes: ["Inscription", "2eme versement"] },
    // Mehdi — poids lourd, 1 gros paiement
    { candidateIndex: 4, amounts: [3000], methods: ["VIREMENT"], dates: ["2026-06-20"], notes: ["Inscription permis C"] },
    // Imane — 2 paiements
    { candidateIndex: 5, amounts: [2000, 1500], methods: ["CASH", "CASH"], dates: ["2026-04-15", "2026-05-20"], notes: ["Inscription", "2eme versement"] },
    // Amine — tout paye
    { candidateIndex: 6, amounts: [2500, 2000], methods: ["CASH", "VIREMENT"], dates: ["2026-03-01", "2026-04-15"], notes: ["Inscription", "Solde"] },
    // Houda — 1 paiement
    { candidateIndex: 7, amounts: [2000], methods: ["CASH"], dates: ["2026-06-01"], notes: ["Inscription"] },
    // Adil — moto, 1 paiement
    { candidateIndex: 8, amounts: [1500], methods: ["CASH"], dates: ["2026-06-25"], notes: ["Inscription moto"] },
    // Nadia — tout paye
    { candidateIndex: 9, amounts: [2500, 2000], methods: ["CASH", "CASH"], dates: ["2026-01-15", "2026-03-01"], notes: ["Inscription", "Solde"] },
    // Hamza
    { candidateIndex: 10, amounts: [2000, 1000], methods: ["CASH", "VIREMENT"], dates: ["2026-05-10", "2026-06-15"], notes: ["Inscription", "Partiel"] },
    // Sara
    { candidateIndex: 11, amounts: [2000], methods: ["CASH"], dates: ["2026-06-22"], notes: ["Inscription"] },
    // Zakaria — remorque, gros montant
    { candidateIndex: 12, amounts: [4000, 2000], methods: ["VIREMENT", "CHEQUE"], dates: ["2026-04-01", "2026-05-15"], notes: ["Inscription permis EC", "2eme versement"] },
    // Meryem
    { candidateIndex: 13, amounts: [2000, 1500], methods: ["CASH", "CASH"], dates: ["2026-05-20", "2026-06-18"], notes: ["Inscription", "2eme versement"] },
    // Rachid — transport, 1 paiement
    { candidateIndex: 14, amounts: [4000], methods: ["VIREMENT"], dates: ["2026-06-10"], notes: ["Inscription permis D"] },
    // Fatima — abandonnee, 1 seul paiement
    { candidateIndex: 15, amounts: [1500], methods: ["CASH"], dates: ["2026-03-01"], notes: ["Inscription partielle"] },
    // Khalid
    { candidateIndex: 16, amounts: [2000, 1500], methods: ["CASH", "CASH"], dates: ["2026-05-01", "2026-06-12"], notes: ["Inscription", "2eme versement"] },
    // Amina
    { candidateIndex: 17, amounts: [2500, 1500], methods: ["CASH", "VIREMENT"], dates: ["2026-04-20", "2026-05-25"], notes: ["Inscription", "2eme versement"] },
    // Soufiane
    { candidateIndex: 18, amounts: [2000], methods: ["CASH"], dates: ["2026-06-05"], notes: ["Inscription"] },
    // Rim
    { candidateIndex: 19, amounts: [2000], methods: ["CASH"], dates: ["2026-06-28"], notes: ["Inscription"] },
    // Karim
    { candidateIndex: 20, amounts: [2000, 1000], methods: ["CASH", "CASH"], dates: ["2026-05-15", "2026-06-20"], notes: ["Inscription", "2eme versement"] },
    // Leila
    { candidateIndex: 21, amounts: [2000], methods: ["CASH"], dates: ["2026-06-26"], notes: ["Inscription"] },
  ];

  let totalPayments = 0;
  for (const pd of paymentData) {
    for (let i = 0; i < pd.amounts.length; i++) {
      await prisma.payment.create({
        data: {
          candidateId: candidates[pd.candidateIndex].id,
          amount: pd.amounts[i],
          method: pd.methods[i],
          note: pd.notes[i],
          paidAt: new Date(pd.dates[i]),
        },
      });
      totalPayments++;
    }
  }
  console.log(`${totalPayments} paiements crees`);

  // ============================================
  // SEANCES - semaine courante + prochaine
  // ============================================
  const sessionsData: { candidateIndex: number; moniteurIndex: number; type: "CODE" | "CONDUITE"; date: string; startTime: string; endTime: string; completed: boolean }[] = [
    // Lundi 29 juin
    { candidateIndex: 1,  moniteurIndex: 0, type: "CODE",     date: "2026-06-29", startTime: "08:00", endTime: "09:00", completed: false },
    { candidateIndex: 11, moniteurIndex: 0, type: "CODE",     date: "2026-06-29", startTime: "09:00", endTime: "10:00", completed: false },
    { candidateIndex: 0,  moniteurIndex: 1, type: "CONDUITE", date: "2026-06-29", startTime: "08:30", endTime: "09:30", completed: false },
    { candidateIndex: 3,  moniteurIndex: 2, type: "CONDUITE", date: "2026-06-29", startTime: "10:00", endTime: "11:00", completed: false },
    { candidateIndex: 10, moniteurIndex: 1, type: "CONDUITE", date: "2026-06-29", startTime: "14:00", endTime: "15:00", completed: false },

    // Mardi 30 juin
    { candidateIndex: 4,  moniteurIndex: 0, type: "CODE",     date: "2026-06-30", startTime: "08:00", endTime: "09:00", completed: false },
    { candidateIndex: 19, moniteurIndex: 0, type: "CODE",     date: "2026-06-30", startTime: "09:00", endTime: "10:00", completed: false },
    { candidateIndex: 7,  moniteurIndex: 1, type: "CONDUITE", date: "2026-06-30", startTime: "09:00", endTime: "10:00", completed: false },
    { candidateIndex: 13, moniteurIndex: 2, type: "CONDUITE", date: "2026-06-30", startTime: "10:00", endTime: "11:00", completed: false },
    { candidateIndex: 16, moniteurIndex: 1, type: "CONDUITE", date: "2026-06-30", startTime: "14:00", endTime: "15:00", completed: false },
    { candidateIndex: 20, moniteurIndex: 2, type: "CONDUITE", date: "2026-06-30", startTime: "15:00", endTime: "16:00", completed: false },

    // Mercredi 1 juillet
    { candidateIndex: 8,  moniteurIndex: 0, type: "CODE",     date: "2026-07-01", startTime: "08:00", endTime: "09:00", completed: false },
    { candidateIndex: 14, moniteurIndex: 0, type: "CODE",     date: "2026-07-01", startTime: "09:00", endTime: "10:00", completed: false },
    { candidateIndex: 0,  moniteurIndex: 1, type: "CONDUITE", date: "2026-07-01", startTime: "08:30", endTime: "09:30", completed: false },
    { candidateIndex: 10, moniteurIndex: 2, type: "CONDUITE", date: "2026-07-01", startTime: "10:00", endTime: "11:00", completed: false },
    { candidateIndex: 17, moniteurIndex: 1, type: "CONDUITE", date: "2026-07-01", startTime: "14:00", endTime: "15:00", completed: false },

    // Jeudi 2 juillet
    { candidateIndex: 5,  moniteurIndex: 0, type: "CODE",     date: "2026-07-02", startTime: "08:00", endTime: "09:00", completed: false },
    { candidateIndex: 12, moniteurIndex: 0, type: "CODE",     date: "2026-07-02", startTime: "09:00", endTime: "10:00", completed: false },
    { candidateIndex: 3,  moniteurIndex: 1, type: "CONDUITE", date: "2026-07-02", startTime: "09:00", endTime: "10:00", completed: false },
    { candidateIndex: 7,  moniteurIndex: 2, type: "CONDUITE", date: "2026-07-02", startTime: "10:00", endTime: "11:00", completed: false },
    { candidateIndex: 20, moniteurIndex: 1, type: "CONDUITE", date: "2026-07-02", startTime: "14:00", endTime: "15:00", completed: false },

    // Vendredi 3 juillet
    { candidateIndex: 18, moniteurIndex: 0, type: "CODE",     date: "2026-07-03", startTime: "08:00", endTime: "09:00", completed: false },
    { candidateIndex: 21, moniteurIndex: 0, type: "CODE",     date: "2026-07-03", startTime: "09:00", endTime: "10:00", completed: false },
    { candidateIndex: 16, moniteurIndex: 2, type: "CONDUITE", date: "2026-07-03", startTime: "09:00", endTime: "10:00", completed: false },
    { candidateIndex: 13, moniteurIndex: 1, type: "CONDUITE", date: "2026-07-03", startTime: "10:00", endTime: "11:00", completed: false },

    // Seances passees (completes) — semaine derniere
    { candidateIndex: 0,  moniteurIndex: 1, type: "CONDUITE", date: "2026-06-22", startTime: "08:00", endTime: "09:00", completed: true },
    { candidateIndex: 0,  moniteurIndex: 1, type: "CONDUITE", date: "2026-06-24", startTime: "08:00", endTime: "09:00", completed: true },
    { candidateIndex: 3,  moniteurIndex: 2, type: "CONDUITE", date: "2026-06-23", startTime: "10:00", endTime: "11:00", completed: true },
    { candidateIndex: 7,  moniteurIndex: 1, type: "CONDUITE", date: "2026-06-25", startTime: "09:00", endTime: "10:00", completed: true },
    { candidateIndex: 10, moniteurIndex: 2, type: "CONDUITE", date: "2026-06-22", startTime: "14:00", endTime: "15:00", completed: true },
    { candidateIndex: 1,  moniteurIndex: 0, type: "CODE",     date: "2026-06-23", startTime: "08:00", endTime: "09:00", completed: true },
    { candidateIndex: 4,  moniteurIndex: 0, type: "CODE",     date: "2026-06-24", startTime: "08:00", endTime: "09:00", completed: true },
    { candidateIndex: 11, moniteurIndex: 0, type: "CODE",     date: "2026-06-25", startTime: "09:00", endTime: "10:00", completed: true },
    { candidateIndex: 13, moniteurIndex: 1, type: "CONDUITE", date: "2026-06-26", startTime: "10:00", endTime: "11:00", completed: true },
    { candidateIndex: 16, moniteurIndex: 2, type: "CONDUITE", date: "2026-06-26", startTime: "14:00", endTime: "15:00", completed: true },
    { candidateIndex: 20, moniteurIndex: 1, type: "CONDUITE", date: "2026-06-27", startTime: "09:00", endTime: "10:00", completed: true },
  ];

  for (const s of sessionsData) {
    await prisma.session.create({
      data: {
        type: s.type,
        date: new Date(s.date),
        startTime: s.startTime,
        endTime: s.endTime,
        candidateId: candidates[s.candidateIndex].id,
        moniteurId: moniteurs[s.moniteurIndex].id,
        completed: s.completed,
      },
    });
  }
  console.log(`${sessionsData.length} seances creees`);

  // ============================================
  // HEURES DE CONDUITE (historique)
  // ============================================
  const drivingData: { candidateIndex: number; moniteurIndex: number; date: string; duration: number; note: string }[] = [
    // Youssef — 8 heures (avance)
    { candidateIndex: 0, moniteurIndex: 1, date: "2026-05-05", duration: 60, note: "1ere lecon - embrayage" },
    { candidateIndex: 0, moniteurIndex: 1, date: "2026-05-12", duration: 60, note: "Demarrage en cote" },
    { candidateIndex: 0, moniteurIndex: 1, date: "2026-05-19", duration: 60, note: "Creneaux" },
    { candidateIndex: 0, moniteurIndex: 1, date: "2026-05-26", duration: 60, note: "Circulation ville" },
    { candidateIndex: 0, moniteurIndex: 1, date: "2026-06-02", duration: 60, note: "Rond-point + priorite" },
    { candidateIndex: 0, moniteurIndex: 1, date: "2026-06-09", duration: 60, note: "Autoroute" },
    { candidateIndex: 0, moniteurIndex: 1, date: "2026-06-16", duration: 60, note: "Parcours examen" },
    { candidateIndex: 0, moniteurIndex: 1, date: "2026-06-23", duration: 60, note: "Revision generale" },

    // Khadija — 5 heures
    { candidateIndex: 3, moniteurIndex: 2, date: "2026-05-15", duration: 60, note: "1ere lecon" },
    { candidateIndex: 3, moniteurIndex: 2, date: "2026-05-22", duration: 60, note: "Manoeuvres" },
    { candidateIndex: 3, moniteurIndex: 2, date: "2026-05-29", duration: 60, note: "Circulation" },
    { candidateIndex: 3, moniteurIndex: 2, date: "2026-06-05", duration: 60, note: "Stationnement" },
    { candidateIndex: 3, moniteurIndex: 2, date: "2026-06-19", duration: 60, note: "Parcours libre" },

    // Omar — 12 heures (permis obtenu!)
    { candidateIndex: 2, moniteurIndex: 0, date: "2026-02-10", duration: 60, note: "1ere lecon" },
    { candidateIndex: 2, moniteurIndex: 0, date: "2026-02-17", duration: 60, note: "Embrayage + direction" },
    { candidateIndex: 2, moniteurIndex: 0, date: "2026-02-24", duration: 60, note: "Demarrage cote" },
    { candidateIndex: 2, moniteurIndex: 0, date: "2026-03-03", duration: 60, note: "Creneaux" },
    { candidateIndex: 2, moniteurIndex: 0, date: "2026-03-10", duration: 60, note: "Circulation" },
    { candidateIndex: 2, moniteurIndex: 0, date: "2026-03-17", duration: 60, note: "Rond-point" },
    { candidateIndex: 2, moniteurIndex: 0, date: "2026-03-24", duration: 60, note: "Priorite droite" },
    { candidateIndex: 2, moniteurIndex: 0, date: "2026-03-31", duration: 60, note: "Autoroute" },
    { candidateIndex: 2, moniteurIndex: 0, date: "2026-04-07", duration: 60, note: "Parcours examen 1" },
    { candidateIndex: 2, moniteurIndex: 0, date: "2026-04-14", duration: 60, note: "Parcours examen 2" },
    { candidateIndex: 2, moniteurIndex: 0, date: "2026-04-21", duration: 60, note: "Revision" },
    { candidateIndex: 2, moniteurIndex: 0, date: "2026-04-28", duration: 60, note: "Derniere revision" },

    // Houda — 3 heures
    { candidateIndex: 7, moniteurIndex: 1, date: "2026-06-10", duration: 60, note: "1ere lecon" },
    { candidateIndex: 7, moniteurIndex: 1, date: "2026-06-17", duration: 60, note: "Embrayage" },
    { candidateIndex: 7, moniteurIndex: 1, date: "2026-06-24", duration: 60, note: "Manoeuvres" },

    // Hamza — 4 heures
    { candidateIndex: 10, moniteurIndex: 2, date: "2026-05-20", duration: 60, note: "1ere lecon" },
    { candidateIndex: 10, moniteurIndex: 2, date: "2026-05-27", duration: 60, note: "Creneaux" },
    { candidateIndex: 10, moniteurIndex: 2, date: "2026-06-03", duration: 60, note: "Circulation" },
    { candidateIndex: 10, moniteurIndex: 2, date: "2026-06-17", duration: 60, note: "Rond-point" },

    // Meryem — 4 heures
    { candidateIndex: 13, moniteurIndex: 1, date: "2026-06-01", duration: 60, note: "1ere lecon" },
    { candidateIndex: 13, moniteurIndex: 1, date: "2026-06-08", duration: 60, note: "Direction + frein" },
    { candidateIndex: 13, moniteurIndex: 1, date: "2026-06-15", duration: 60, note: "Circulation calme" },
    { candidateIndex: 13, moniteurIndex: 1, date: "2026-06-22", duration: 60, note: "Manoeuvres parking" },

    // Khalid — 5 heures
    { candidateIndex: 16, moniteurIndex: 2, date: "2026-05-10", duration: 60, note: "1ere lecon" },
    { candidateIndex: 16, moniteurIndex: 2, date: "2026-05-17", duration: 60, note: "Embrayage avance" },
    { candidateIndex: 16, moniteurIndex: 2, date: "2026-05-24", duration: 60, note: "Ville" },
    { candidateIndex: 16, moniteurIndex: 2, date: "2026-06-07", duration: 60, note: "Autoroute" },
    { candidateIndex: 16, moniteurIndex: 2, date: "2026-06-21", duration: 60, note: "Parcours examen" },

    // Karim — 6 heures
    { candidateIndex: 20, moniteurIndex: 1, date: "2026-05-20", duration: 60, note: "1ere lecon" },
    { candidateIndex: 20, moniteurIndex: 1, date: "2026-05-27", duration: 60, note: "Demarrage cote" },
    { candidateIndex: 20, moniteurIndex: 1, date: "2026-06-03", duration: 60, note: "Creneaux" },
    { candidateIndex: 20, moniteurIndex: 1, date: "2026-06-10", duration: 60, note: "Circulation" },
    { candidateIndex: 20, moniteurIndex: 1, date: "2026-06-17", duration: 60, note: "Priorites" },
    { candidateIndex: 20, moniteurIndex: 1, date: "2026-06-24", duration: 60, note: "Parcours libre" },

    // Amine — 10 heures (examen planifie)
    { candidateIndex: 6, moniteurIndex: 0, date: "2026-03-15", duration: 60, note: "1ere lecon" },
    { candidateIndex: 6, moniteurIndex: 0, date: "2026-03-22", duration: 60, note: "Embrayage" },
    { candidateIndex: 6, moniteurIndex: 0, date: "2026-03-29", duration: 60, note: "Cote" },
    { candidateIndex: 6, moniteurIndex: 0, date: "2026-04-05", duration: 60, note: "Creneaux" },
    { candidateIndex: 6, moniteurIndex: 0, date: "2026-04-12", duration: 60, note: "Ville" },
    { candidateIndex: 6, moniteurIndex: 0, date: "2026-04-19", duration: 60, note: "Autoroute" },
    { candidateIndex: 6, moniteurIndex: 0, date: "2026-04-26", duration: 60, note: "Rond-point" },
    { candidateIndex: 6, moniteurIndex: 0, date: "2026-05-03", duration: 60, note: "Parcours 1" },
    { candidateIndex: 6, moniteurIndex: 0, date: "2026-05-10", duration: 60, note: "Parcours 2" },
    { candidateIndex: 6, moniteurIndex: 0, date: "2026-05-17", duration: 60, note: "Revision finale" },

    // Nadia — 10 heures (permis obtenu)
    { candidateIndex: 9, moniteurIndex: 2, date: "2026-01-20", duration: 60, note: "1ere lecon" },
    { candidateIndex: 9, moniteurIndex: 2, date: "2026-01-27", duration: 60, note: "Direction" },
    { candidateIndex: 9, moniteurIndex: 2, date: "2026-02-03", duration: 60, note: "Cote" },
    { candidateIndex: 9, moniteurIndex: 2, date: "2026-02-10", duration: 60, note: "Creneaux" },
    { candidateIndex: 9, moniteurIndex: 2, date: "2026-02-17", duration: 60, note: "Ville" },
    { candidateIndex: 9, moniteurIndex: 2, date: "2026-02-24", duration: 60, note: "Priorites" },
    { candidateIndex: 9, moniteurIndex: 2, date: "2026-03-03", duration: 60, note: "Autoroute" },
    { candidateIndex: 9, moniteurIndex: 2, date: "2026-03-10", duration: 60, note: "Parcours 1" },
    { candidateIndex: 9, moniteurIndex: 2, date: "2026-03-17", duration: 60, note: "Parcours 2" },
    { candidateIndex: 9, moniteurIndex: 2, date: "2026-03-24", duration: 60, note: "Derniere seance" },
  ];

  for (const dh of drivingData) {
    await prisma.drivingHour.create({
      data: {
        candidateId: candidates[dh.candidateIndex].id,
        moniteurId: moniteurs[dh.moniteurIndex].id,
        date: new Date(dh.date),
        duration: dh.duration,
        note: dh.note,
      },
    });
  }
  console.log(`${drivingData.length} heures de conduite creees`);

  // ============================================
  // RESUME
  // ============================================
  const totalRevenue = paymentData.reduce((sum, pd) => sum + pd.amounts.reduce((s, a) => s + a, 0), 0);
  const totalFees = candidatesData.reduce((sum, c) => sum + c.totalFee, 0);

  console.log("\n========================================");
  console.log("DONNEES DE DEMO PRETES !");
  console.log("========================================");
  console.log(`Auto-ecole: ${ecole.name} (${ecole.city})`);
  console.log(`Candidats: ${candidates.length}`);
  console.log(`Moniteurs: ${moniteurs.length}`);
  console.log(`Paiements: ${totalPayments} (${totalRevenue.toLocaleString()} MAD)`);
  console.log(`Impayes: ${(totalFees - totalRevenue).toLocaleString()} MAD`);
  console.log(`Seances: ${sessionsData.length}`);
  console.log(`Heures de conduite: ${drivingData.length}`);
  console.log("========================================");
  console.log("Login: gerant / siyaqi2026");
  console.log("========================================\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
