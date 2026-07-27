import React, { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

export const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    employees: 'Employees',
    projects: 'Publication Projects',
    tasks: 'Tasks & Workflow',
    attendance: 'Attendance',
    payroll: 'Salary & Payroll',
    reports: 'Reports & Export',
    notifications: 'Notifications',
    settings: 'Settings',
    myTasks: 'My Tasks',
    myAttendance: 'My Attendance',
    mySalary: 'My Salary Slip',
    myProfile: 'My Profile',
    logout: 'Logout',
    signIn: 'Sign In to Portal',
    trackBookStatus: 'Track Book Status',
    publishingServices: 'Publishing Services',
    aboutUs: 'About Us',
    employeePortal: 'Employee / Admin Login',

    // Dashboard Cards & Headers
    executiveDashboard: 'Executive Admin Dashboard',
    welcomeBack: 'Welcome back',
    overviewSubtitle: 'Pustak Market Book Publication & Distribution Overview',
    totalWorkforce: 'Total Workforce',
    activeEmployees: 'Active Employees',
    publicationSeries: 'Publication Series',
    activeProjects: 'Active Book Projects',
    totalTasks: 'Total Workflow Tasks',
    pendingTasks: 'Pending Workflow',
    approvedTasks: 'Approved Tasks',
    todayAttendance: "Today's Attendance",
    monthlySalaryExpense: 'Monthly Salary Expense',
    pendingPayouts: 'Pending Payouts',

    // Buttons & Actions
    addEmployee: 'Add Employee',
    launchProject: 'Launch Project',
    runPayroll: 'Run Payroll',
    exportReports: 'Export Reports',
    quickAddProject: '+ Quick Add New Project',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    createProject: 'Create Project',
    assignTask: 'Assign Task',
    trackProjectStatus: 'Track Project Status',
    enterTrackId: 'Enter Project ID, ISBN, or Book Name...',

    // Labels & Table Headers
    employeeId: 'Employee ID',
    fullName: 'Full Name',
    department: 'Department',
    designation: 'Designation',
    salaryModel: 'Salary Model',
    compensation: 'Compensation',
    status: 'Status',
    actions: 'Actions',
    projectId: 'Project ID',
    bookTitle: 'Book Title',
    author: 'Author Name',
    category: 'Category',
    budget: 'Estimated Budget',
    progress: 'Completion Progress',
    deadline: 'Target Release Date',
    taskTitle: 'Task Title',
    assignedTo: 'Assigned Employees',
    payoutAmount: 'Payout Amount',

    // Statuses
    active: 'Active',
    completed: 'Completed',
    inProgress: 'In Progress',
    pending: 'Pending',
    planning: 'Planning',
    hold: 'Hold',

    // Public Tracking Page
    publicTrackerTitle: 'Real-Time Book Publication Status Tracker',
    publicTrackerSubtitle: 'Authors & Clients can track book manuscript progress, ISBN status, & release timelines.',
    realTimeStages: 'REAL-TIME PUBLICATION TRACKING STAGES & MILESTONES:',
    assignedSpecialists: 'Assigned Specialists',
    targetReleaseDate: 'Target Release Date',
    overallProgress: 'Overall Publishing Progress',
  },
  mr: {
    // Navigation (मराठी)
    dashboard: 'डॅशबोर्ड',
    employees: 'कर्मचारी सूची',
    projects: 'पुस्तक प्रकल्प',
    tasks: 'कामे व टास्क',
    attendance: 'हजेरी नोंद',
    payroll: 'वेतन व पगार',
    reports: 'अहवाल (Reports)',
    notifications: 'सूचना',
    settings: 'सेटिंग्ज',
    myTasks: 'माझी कामे',
    myAttendance: 'माझी हजेरी',
    mySalary: 'माझे पगार पत्रक',
    myProfile: 'माझे प्रोफाइल',
    logout: 'बाहेर पडा (Logout)',
    signIn: 'पोर्टलवर लॉगिन करा',
    trackBookStatus: 'पुस्तकाची प्रगती ट्रॅक करा',
    publishingServices: 'प्रकाशन सेवा',
    aboutUs: 'आमच्याबद्दल',
    employeePortal: 'कर्मचारी / ॲडमिन लॉगिन',

    // Dashboard Cards & Headers
    executiveDashboard: 'मुख्य ॲडमिन डॅशबोर्ड',
    welcomeBack: 'पुन्हा स्वागत आहे',
    overviewSubtitle: 'पुस्तक मार्केट प्रकाशन आणि वितरण व्यवस्थापन',
    totalWorkforce: 'एकूण कर्मचारी',
    activeEmployees: 'कार्यरत कर्मचारी',
    publicationSeries: 'प्रकाशन मालिका',
    activeProjects: 'सुरू असलेली पुस्तके',
    totalTasks: 'एकूण नियुक्त कामे',
    pendingTasks: 'बाकी असलेली कामे',
    approvedTasks: 'मंजूर झालेली कामे',
    todayAttendance: 'आजची हजेरी',
    monthlySalaryExpense: 'मासिक पगार खर्च',
    pendingPayouts: 'बाकी असलेली देयके',

    // Buttons & Actions
    addEmployee: 'नवीन कर्मचारी जोडा',
    launchProject: 'नवीन पुस्तक प्रकल्प',
    runPayroll: 'पगार जमा करा',
    exportReports: 'एक्सेल अहवाल डाऊनलोड',
    quickAddProject: '+ त्वरित नवीन पुस्तक जोडा',
    saveChanges: 'बदल जतन करा',
    cancel: 'रद्द करा',
    createProject: 'प्रकल्प तयार करा',
    assignTask: 'काम सोपवा (Assign)',
    trackProjectStatus: 'पुस्तकाची स्थिती ट्रॅक करा',
    enterTrackId: 'प्रकल्प आयडी (PM-2026-XXXX), ISBN किंवा पुस्तकाचे नाव टाका...',

    // Labels & Table Headers
    employeeId: 'कर्मचारी आयडी',
    fullName: 'पूर्ण नाव',
    department: 'विभाग (Department)',
    designation: 'पद (Designation)',
    salaryModel: 'पगार मॉडेल',
    compensation: 'मानधन (पगार)',
    status: 'स्थिती (Status)',
    actions: 'कृती (Actions)',
    projectId: 'प्रकल्प आयडी',
    bookTitle: 'पुस्तकाचे नाव',
    author: 'लेखकाचे नाव',
    category: 'वर्ग / विषय',
    budget: 'अंदाजपत्रक (Budget)',
    progress: 'एकूण प्रगती (%)',
    deadline: 'प्रकाशन तारीख',
    taskTitle: 'कामाचे शीर्षक',
    assignedTo: 'नियुक्त कर्मचारी',
    payoutAmount: 'मिळणारे मानधन',

    // Statuses
    active: 'सुरू (Active)',
    completed: 'पूर्ण (Completed)',
    inProgress: 'काम चालू (In Progress)',
    pending: 'प्रलंबित (Pending)',
    planning: 'नियोजन (Planning)',
    hold: 'स्थगित (Hold)',

    // Public Tracking Page
    publicTrackerTitle: 'थेट पुस्तक मुद्रण व प्रगती ट्रॅकर',
    publicTrackerSubtitle: 'लेखक आणि ग्राहक त्यांच्या पुस्तकाचे संपादन, मुखपृष्ठ रचना व मुद्रण स्थिती थेट पाहू शकतात.',
    realTimeStages: 'प्रकाशन टप्पे व प्रगती स्थिती (Real-Time Stages):',
    assignedSpecialists: 'नियुक्त तज्ज्ञ टीम',
    targetReleaseDate: 'अपेक्षित प्रकाशन तारीख',
    overallProgress: 'एकूण प्रकाशन प्रगती',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('pustak_lang') || 'mr'; // Default to Marathi
  });

  useEffect(() => {
    localStorage.setItem('pustak_lang', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'mr' : 'en'));
  };

  const t = (key) => {
    const lang = language === 'mr' ? 'mr' : 'en';
    return (translations[lang] && translations[lang][key]) || (translations['en'] && translations['en'][key]) || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
