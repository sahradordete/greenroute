const Journey = require('../../models/Journey');
const TransportMode = require('../../models/TransportMode');

exports.createJourney = async (req, res) => {
  try {

    const userId = req.session.user.id;
    const { modeId, distanceKm, origin, destination } = req.body;

    if (!modeId || !distanceKm || !origin || !destination) {
      return res.redirect('/journeys/new');
    }

    const distance = Number(distanceKm);
    if (Number.isNaN(distance) || distance <= 0) {
      return res.redirect('/journeys/new');
    }

    const mode = await TransportMode.findById(modeId);
    if (!mode) {
      return res.redirect('/journeys/new');
    }
    if (!mode.active) {
      return res.redirect('/journeys/new');
    }

    const emissionFactorUsed = Number(mode.emissionFactor);
    const estimatedEmissions = distance * emissionFactorUsed;

    const journey = await Journey.create({
      userId,
      modeId: mode._id,
      origin: origin.trim(),
      destination: destination.trim(),
      distanceKm: distance,
      emissionFactorUsed,
      estimatedEmissions,
    });

    return res.redirect('/journeys');

  } catch (err) {
    console.error('CREATE JOURNEY ERROR:', err.message);
    console.error('FULL ERROR:', err);
    return res.redirect('/journeys/new');
  }
};

exports.getMyJourneys = async (req, res) => {
  try {

    const userId = req.session.user.id;

    const journeys = await Journey.find({ userId })
      .sort({ createdAt: -1 })
      .populate('modeId'); 

    return res.json({ success: true, data: journeys });
  } catch (err) {
    console.error('GET MY JOURNEYS ERROR:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getJourneyById = async (req, res) => {
  try {

    const { id } = req.params;
    const isAdmin = req.session.user.role === 'admin';

    const journey = await Journey.findById(id).populate('modeId');
    if (!journey) {
      return res.status(404).json({ success: false, message: 'Journey not found.' });
    }

    if (!isAdmin && journey.userId.toString() !== req.session.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    return res.json({ success: true, data: journey });
  } catch (err) {
    console.error('GET JOURNEY BY ID ERROR:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};