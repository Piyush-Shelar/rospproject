import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
  symbol:        { type: String, required: true, uppercase: true, trim: true },
  type:          { type: String, required: true, enum: ['stock', 'bond', 'crypto', 'cash', 'mutual_fund', 'etf'] },
  quantity:      { type: Number, required: true, min: 0 },
  purchasePrice: { type: Number, required: true, min: 0 },
  currentPrice:  { type: Number, required: true, min: 0 },
}, { _id: false });

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  assets: [assetSchema],
  riskTolerance: {
    type: String,
    enum: ['conservative', 'moderate', 'aggressive'],
    default: 'moderate',
  },
  financialGoals: [{ type: String, trim: true }],
  updatedAt: { type: Date, default: Date.now },
}, { versionKey: false });

// Auto-update updatedAt on save
portfolioSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
export default Portfolio;
