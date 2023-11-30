const User = require('../models/User');

exports.createUser = async (req, res) => {
  const user = await User.create(req.body);

  res.status(201).json({ user });
};

exports.getAllUsers = async (req, res) => {
  const result = await User.aggregate([
    {
      $group: {
        _id: '$role',
        users: { $push: '$$ROOT' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        role: '$_id',
        count: 1,
        users: {
          $map: {
            input: '$users',
            as: 'user',
            in: {
              name: '$$user.name',
              username: '$$user.username',
              gender: '$$user.gender',
              address: '$$user.address',
              guardian_name: '$$user.guardian_name',
              phone: '$$user.phone',
              role: '$$user.role',
            },
          },
        },
      },
    },
  ]);

  res.status(200).json({ result });
};

exports.getUsers = async (req, res) => {
  const users = await User.find({})
    .select('-password -createdAt -updatedAt -__v')
    .sort('-createdAt');

  res.json({ count: users.length, users });
};

exports.getUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findOne({ _id: id });

  if (!user) {
    throw new Error(`No user found with id ${id}`);
  }

  res.status(200).json({ user });
};
exports.updateUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findOneAndUpdate(
    {
      _id: id,
    },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    res.status(404).json(`No user found with id ${id}`);
  }

  res.status(200).json({ user });
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findOneAndDelete({
    _id: id,
  });

  if (!user) {
    res.status(404).json(`No user found with id ${id}`);
  }

  res.status(200).json({ msg: 'User deleted successfully' });
};
