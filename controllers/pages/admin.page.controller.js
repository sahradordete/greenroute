const User = require('../../models/User');
const Journey = require('../../models/Journey');
const TransportMode = require('../../models/TransportMode');


exports.dashboard = async (req, res) => {
  try {
    const [usersCount, journeysCount, activeModesCount] = await Promise.all([
      User.countDocuments({}),
      Journey.countDocuments({}),
      TransportMode.countDocuments({ active: true }),
    ]);

    return res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats: { usersCount, journeysCount, activeModesCount },
      user: req.session.user,
    });
  } catch (err) {
    console.error('ADMIN DASHBOARD ERROR:', err);
    return res.status(500).send('Server error');
  }
};

exports.showManageModes = async (req, res) => {
  try {

    const modes = await TransportMode.find({}).sort({ name: 1 });

    return res.render('admin/modes', {
      title: 'Manage Modes',
      modes,
      user: req.session.user,
    });
  } catch (err) {
    console.error('ADMIN MODES PAGE ERROR:', err);
    return res.status(500).send('Server error');
  }
};

exports.showManageUsers = async (req, res) => {
  try {

    const users = await User.find({}, '_id name email role accountStatus').sort({ createdAt: -1 });

    return res.render('admin/users', {
      title: 'Manage Users',
      users,
      user: req.session.user,
    });
  } catch (err) {
    console.error('ADMIN USERS PAGE ERROR:', err);
    return res.status(500).send('Server error');
  }
};

exports.showManageJourneys = async (req, res) => {
  try {
    const journeys = await Journey.find({})
      .sort({ createdAt: -1 })
      .populate('modeId')
      .populate('userId', 'name email'); // se Journey.userId for ref
    
    console.log('journeys found:', journeys.length);

    return res.render('admin/journeys', {
      title: 'Manage Journeys',
      journeys,
      user: req.session.user,
    });
  } catch (err) {
    console.error('ADMIN JOURNEYS PAGE ERROR:', err);
    return res.status(500).send('Server error');
  }
};