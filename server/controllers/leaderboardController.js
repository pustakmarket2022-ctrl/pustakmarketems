const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');
const Overtime = require('../models/Overtime');

// @desc    Get Employee Performance Leaderboard & Ranking
// @route   GET /api/leaderboard
// @access  Private (Admin / HR / Manager / Employee)
exports.getLeaderboard = async (req, res, next) => {
  try {
    const { department, month, year } = req.query;

    const query = { isDeleted: { $ne: true }, status: 'Active' };
    if (department && department !== 'All') {
      query.department = department;
    }

    const employees = await User.find(query).select(
      'fullName email employeeId department designation profileImage role joiningDate'
    );

    const leaderboard = [];

    for (const emp of employees) {
      // 1. Task Performance Metrics (Max 40 points)
      const empTasks = await Task.find({ assignedTo: emp._id });
      const completedTasks = empTasks.filter(
        (t) => t.taskStatus === 'Approved' || t.taskStatus === 'Completed'
      );
      const taskCount = completedTasks.length;
      const totalAssigned = empTasks.length;

      const completionRate = totalAssigned > 0 ? completedTasks.length / totalAssigned : 0;
      const taskScore = Math.min(
        40,
        Math.round(completionRate * 25 + Math.min(15, taskCount * 3))
      );

      // 2. Attendance Metrics (Max 35 points)
      const attendances = await Attendance.find({ user: emp._id });
      const presentDays = attendances.filter(
        (a) => a.status === 'Present' || a.status === 'Late' || a.status === 'Half Day'
      ).length;
      const workingDays = Math.max(1, attendances.length || 22);

      const attendanceRate = Math.min(1, presentDays / workingDays);
      const attendanceScore = Math.round(attendanceRate * 35);

      // 3. Punctuality Metrics (Max 15 points)
      const onTimeDays = attendances.filter((a) => a.status === 'Present').length;
      const punctualityRate = presentDays > 0 ? onTimeDays / presentDays : 1;
      const punctualityScore = Math.round(punctualityRate * 15);

      // 4. Overtime & Contribution Metrics (Max 10 points)
      const overtimes = await Overtime.find({ user: emp._id, status: 'Approved' });
      const overtimeHours = overtimes.reduce((sum, o) => sum + (o.hours || 0), 0);
      const overtimeScore = Math.min(10, Math.round(overtimeHours * 1.5));

      // Total Algorithmic Score (0 - 100)
      const totalScore = Math.min(
        100,
        taskScore + attendanceScore + punctualityScore + overtimeScore
      );

      leaderboard.push({
        _id: emp._id,
        fullName: emp.fullName,
        employeeId: emp.employeeId,
        department: emp.department || 'General',
        designation: emp.designation || 'Staff',
        profileImage: emp.profileImage || '',
        score: totalScore,
        taskScore,
        attendanceScore,
        punctualityScore,
        overtimeScore,
        metrics: {
          tasksCompleted: taskCount,
          totalTasks: totalAssigned,
          completionRate: Math.round(completionRate * 100),
          presentDays,
          attendanceRate: Math.round(attendanceRate * 100),
          onTimeDays,
          overtimeHours,
        },
      });
    }

    // Sort by Total Score Descending
    leaderboard.sort((a, b) => b.score - a.score);

    // Assign Rank & Badges
    const rankedLeaderboard = leaderboard.map((item, index) => {
      const rank = index + 1;
      let badge = 'Performer';
      let badgeColor = 'var(--primary)';

      if (rank === 1) {
        badge = '👑 Employee of the Month';
        badgeColor = '#eab308'; // Gold
      } else if (rank === 2) {
        badge = '🥈 Silver Achiever';
        badgeColor = '#94a3b8'; // Silver
      } else if (rank === 3) {
        badge = '🥉 Bronze Contender';
        badgeColor = '#b45309'; // Bronze
      } else if (rank <= 5) {
        badge = '⭐ Top Performer';
        badgeColor = '#3b82f6';
      }

      return {
        ...item,
        rank,
        badge,
        badgeColor,
      };
    });

    res.status(200).json({
      success: true,
      count: rankedLeaderboard.length,
      data: rankedLeaderboard,
    });
  } catch (err) {
    next(err);
  }
};
