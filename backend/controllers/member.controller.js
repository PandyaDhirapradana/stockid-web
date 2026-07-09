const Member = require('../models/Member.model');
const xlsx = require('xlsx'); 

// GET /api/members — all members
const getAllMembers = async (req, res, next) => {
  try {
    const { search, category, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (category && ['Basic', 'Intermediate', 'Advanced', 'VIP'].includes(category)) {
      query.classCategory = category;
    }
    if (status === 'active') query.endDate = { $gt: new Date() };
    if (status === 'expired') query.endDate = { $lte: new Date() };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Member.countDocuments(query);
    const members = await Member.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: members,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/members — create member
const createMember = async (req, res, next) => {
  try {
    const { name, phone, classCategory, startDate, durationDays, reason } = req.body;

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + parseInt(durationDays));

    const member = await Member.create({
      name: name.trim(),
      phone: phone.trim(),
      classCategory,
      startDate: start,
      endDate: end,
      durationHistory: [{
        addedBy: req.admin.name,
        addedDays: parseInt(durationDays),
        previousEndDate: null,
        newEndDate: end,
        reason: reason || 'Initial registration',
      }],
    });

    res.status(201).json({ success: true, message: 'Member created successfully', data: member });
  } catch (error) {
    next(error);
  }
};

// PUT /api/members/:id — update member info
const updateMember = async (req, res, next) => {
  try {
    const { name, phone, classCategory } = req.body;
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    if (name) member.name = name.trim();
    if (phone) member.phone = phone.trim();
    if (classCategory) member.classCategory = classCategory;

    await member.save();
    res.json({ success: true, message: 'Member updated successfully', data: member });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/members/:id
const deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/members/:id/extend — extend duration
const extendMember = async (req, res, next) => {
  try {
    const { durationDays, reason } = req.body;
    if (!durationDays || isNaN(durationDays) || durationDays < 1) {
      return res.status(400).json({ success: false, message: 'Invalid duration days' });
    }

    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    const previousEndDate = new Date(member.endDate);
    // If already expired, extend from today
    const baseDate = previousEndDate < new Date() ? new Date() : previousEndDate;
    const newEndDate = new Date(baseDate);
    newEndDate.setDate(newEndDate.getDate() + parseInt(durationDays));

    member.endDate = newEndDate;
    member.durationHistory.push({
      addedBy: req.admin.name,
      addedDays: parseInt(durationDays),
      previousEndDate,
      newEndDate,
      reason: reason || 'Manual extension by admin',
    });

    await member.save();
    res.json({ success: true, message: 'Membership extended successfully', data: member });
  } catch (error) {
    next(error);
  }
};

// GET /api/members/export — export to Excel
const exportMembers = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    let query = {};
    let fileName = 'members-all';
    let sheetTitle = 'Semua Member';

    if (month && year) {
      const m = parseInt(month);
      const y = parseInt(year);
      const startDate = new Date(y, m - 1, 1);
      const endDate = new Date(y, m, 0, 23, 59, 59);
      query.createdAt = { $gte: startDate, $lte: endDate };
      const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
      fileName = `members-${monthNames[m - 1]}-${y}`;
      sheetTitle = `Member ${monthNames[m - 1]} ${y}`;
    }

    const members = await Member.find(query).sort({ createdAt: -1 });

    // Buat header manual sebagai baris pertama
    const headers = [['No','Nama','No. WhatsApp','Kelas','Tanggal Mulai','Tanggal Berakhir','Status','Dibuat Pada']];

    const rows = members.map((m, i) => [
      i + 1,
      m.name,
      m.phone,
      m.classCategory,
      new Date(m.startDate).toLocaleDateString('id-ID'),
      new Date(m.endDate).toLocaleDateString('id-ID'),
      new Date() < m.endDate ? 'Aktif' : 'Kedaluwarsa',
      new Date(m.createdAt).toLocaleDateString('id-ID'),
    ]);

    // Gabungkan header + data
    const wsData = [...headers, ...rows];
    const ws = xlsx.utils.aoa_to_sheet(wsData);

    // Set lebar kolom
    ws['!cols'] = [
      { wch: 5 }, { wch: 25 }, { wch: 18 }, { wch: 15 },
      { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 18 },
    ];

    // Bold baris header (row 1) — cara yang didukung xlsx standar
    const colLetters = ['A','B','C','D','E','F','G','H'];
    colLetters.forEach(col => {
      const cell = ws[`${col}1`];
      if (cell) {
        cell.s = { font: { bold: true } };
      }
    });

    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, sheetTitle);

    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (error) {
    next(error);
  }
};

// GET /api/members/stats — dashboard stats
const getMemberStats = async (req, res, next) => {
  try {
    const now = new Date();
    const total = await Member.countDocuments();
    const active = await Member.countDocuments({ endDate: { $gt: now } });
    const expired = total - active;

    // Monthly growth: last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyGrowth = await Member.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedGrowth = monthlyGrowth.map((m) => ({
      month: months[m._id.month - 1],
      count: m.count,
    }));

    res.json({
      success: true,
      data: { total, active, expired, monthlyGrowth: formattedGrowth },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/members/extend-all — perpanjang semua member aktif sekaligus
const extendAllActiveMembers = async (req, res, next) => {
  try {
    const { durationDays, reason } = req.body;
    if (!durationDays || isNaN(durationDays) || durationDays < 1) {
      return res.status(400).json({ success: false, message: 'Durasi hari tidak valid' });
    }

    const now = new Date();
    const activeMembers = await Member.find({ endDate: { $gt: now } });

    if (activeMembers.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada member aktif saat ini' });
    }

    const bulkOps = activeMembers.map((member) => {
      const newEndDate = new Date(member.endDate);
      newEndDate.setDate(newEndDate.getDate() + parseInt(durationDays));

      return {
        updateOne: {
          filter: { _id: member._id },
          update: {
            $set: { endDate: newEndDate },
            $push: {
              durationHistory: {
                addedBy: req.admin.name,
                addedDays: parseInt(durationDays),
                previousEndDate: member.endDate,
                newEndDate,
                reason: reason || 'Perpanjangan massal oleh admin',
              },
            },
          },
        },
      };
    });

    await Member.bulkWrite(bulkOps);

    res.json({
      success: true,
      message: `Berhasil memperpanjang ${activeMembers.length} member aktif selama ${durationDays} hari`,
      data: { affectedCount: activeMembers.length },
    });
  } catch (error) { next(error); }
};

module.exports = {
  getAllMembers,
  createMember,
  updateMember,
  deleteMember,
  extendMember,
  exportMembers,
  getMemberStats,
  extendAllActiveMembers,
};