const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Endpoint to calculate attendance requirements
app.post('/api/calculate', (req, res) => {
    const { totalClasses, attendancePercentage, endDate } = req.body;

    // Validate input
    if (!totalClasses || !attendancePercentage || !endDate) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    // Parse and calculate input data
    const today = new Date();
    const semesterEndDate = new Date(endDate);

    if (semesterEndDate <= today) {
        return res.status(400).json({ message: 'End date must be in the future!' });
    }

    const remainingDays = Math.ceil((semesterEndDate - today) / (1000 * 3600 * 24));
    const remainingWeeks = Math.floor(remainingDays / 7);

    // Attendance calculation
    const classesAttended = Math.round((attendancePercentage / 100) * totalClasses);
    const requiredClassesToReach75 = Math.ceil(0.75 * totalClasses) - classesAttended;

    if (requiredClassesToReach75 <= 0) {
        return res.json({
            message: 'You will already have 75% or more attendance!(Topper)',
            remainingDays,
            classesNeededPerDay: 0,
        });
    }

    // Classes per week (5 days * 7 classes)
    const totalClassDays = remainingWeeks * 5 + (remainingDays % 7 >= 5 ? 5 : remainingDays % 7);
    const classesNeededPerDay = Math.ceil(requiredClassesToReach75 / totalClassDays);

    // Response
    res.json({
        remainingDays,
        requiredClassesToReach75,
        classesNeededPerDay,
        message: `You need to attend ${classesNeededPerDay} classes per day to reach 75% attendance.`
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
