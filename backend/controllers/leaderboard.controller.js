const Member = require('../models/Member.model');

// GET /api/leaderboard
const getLeaderboard = async (req, res, next) => {
  try {
    const { search, sort = 'longest', page = 1, limit = 50 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = {};
    if (sort === 'longest') sortOption = { endDate: -1 };
    else if (sort === 'shortest') sortOption = { endDate: 1 };
    else if (sort === 'alphabetical') sortOption = { name: 1 };
    else sortOption = { endDate: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Member.countDocuments(query);

    const members = await Member.find(query, {
      name: 1, phone: 1, classCategory: 1, endDate: 1, startDate: 1, createdAt: 1,
    })
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const now = new Date();
    const active = await Member.countDocuments({ endDate: { $gt: now } });
    const expired = total - active;

    // Monthly growth last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyGrowth = await Member.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    res.json({
      success: true,
      data: members,
      stats: {
        total,
        active,
        expired,
        monthlyGrowth: monthlyGrowth.map((m) => ({
          month: monthNames[m._id.month - 1],
          count: m.count,
        })),
      },
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLeaderboard };