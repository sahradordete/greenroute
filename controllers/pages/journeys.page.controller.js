const Journey = require('../../models/Journey');
const TransportMode = require('../../models/TransportMode');


exports.showNewJourneyForm = async (req, res) => {
  try {
    const modes = await TransportMode.find({ active: true }).sort({ name: 1 });
    console.log('MODES FOUND:', modes);

    return res.render('journeys/new', {
      title: 'New Journey',
      modes,
      user: req.session.user,
    });
  } catch (err) {
    console.error('SHOW NEW JOURNEY FORM ERROR:', err);
    return res.status(500).send('Server error');
  }
};

exports.showMyJourneys = async (req, res) => {
  try {

    const journeys = await Journey.find({ userId: req.session.user.id })
      .sort({ createdAt: -1 })
      .populate('modeId');

    return res.render('journeys/index', {
      title: 'My Journeys',
      journeys,
      user: req.session.user,
    });
  } catch (err) {
    console.error('SHOW MY JOURNEYS ERROR:', err);
    return res.status(500).send('Server error');
  }
};

exports.showJourneyDetails = async (req, res) => {
  try {

    const { id } = req.params;
    const journey = await Journey.findById(id).populate('modeId');

    if (!journey) {
      return res.status(404).render('errors/404', { title: 'Not Found' });
    }

    const isAdmin = req.session.user.role === 'admin';
    if (!isAdmin && journey.userId.toString() !== req.session.user.id) {
      return res.status(403).render('errors/403', { title: 'Forbidden' });
    }

    return res.render('journeys/show', {
      title: 'Journey Details',
      journey,
      user: req.session.user,
    });
  } catch (err) {
    console.error('SHOW JOURNEY DETAILS ERROR:', err);
    return res.status(500).send('Server error');
  }
};