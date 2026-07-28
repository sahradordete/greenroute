const TransportMode = require('../../models/TransportMode');

function requireAdmin(req, res) {
  if (req.session.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin access required.' });
    return false;
  }
  return true;
}

exports.getActiveModes = async (req, res) => {
  try {
    const mode = await TransportMode.findByIdAndUpdate(id, updates, { returnDocument: 'after' });
    return res.json({ success: true, data: mode });
  } catch (err) {
    console.error('GET ACTIVE MODES ERROR:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.createMode = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) {
      return;
    }

    const { name, emissionFactor } = req.body;

    if (!name || emissionFactor === undefined) {
      return res.redirect('/admin/modes');
    }

    const ef = Number(emissionFactor);
    if (Number.isNaN(ef) || ef < 0) {
      return res.redirect('/admin/modes');
    }

    await TransportMode.create({
      name: String(name).trim(),
      emissionFactor: ef,
      active: true,
    });

    return res.redirect('/admin/modes');

  } catch (err) {
    return res.redirect('/admin/modes');
  }
};

exports.updateMode = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) {
      return;
    }

    const { id } = req.params;
    const updates = {};

    if (req.body.name !== undefined) {
      const name = req.body.name;
      updates.name = name.trim();
    }

    if (req.body.emissionFactor !== undefined) {
      const ef = Number(req.body.emissionFactor);
      
      if (!Number.isNaN(ef) && ef >= 0) {
        updates.emissionFactor = ef;
      }
    }

    await TransportMode.findByIdAndUpdate(id, updates, { returnDocument: 'after' });

    return res.redirect('/admin/modes');

  } catch (err) {
    console.error('UPDATE MODE ERROR:', err);
    return res.redirect('/admin/modes');
  }
};

exports.deleteMode = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    await TransportMode.findByIdAndDelete(req.params.id);

    return res.redirect('/admin/modes');

  } catch (err) {
    console.error('DELETE MODE ERROR:', err);
    return res.redirect('/admin/modes');
  }
};



