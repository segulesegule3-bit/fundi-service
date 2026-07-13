import { 
  GraphQLSchema, 
  GraphQLObjectType, 
  GraphQLString, 
  GraphQLList, 
  GraphQLFloat, 
  GraphQLBoolean, 
  GraphQLInt, 
  GraphQLNonNull 
} from 'graphql';
import { db } from '../db';

// 1. Profession Type
const ProfessionType = new GraphQLObjectType({
  name: 'Profession',
  fields: () => ({
    id: { type: GraphQLString },
    nameEn: { type: GraphQLString, resolve: (parent) => parent.name_en },
    nameSw: { type: GraphQLString, resolve: (parent) => parent.name_sw },
    description: { type: GraphQLString },
    iconName: { type: GraphQLString, resolve: (parent) => parent.icon_name },
    commissionPercentage: { type: GraphQLFloat, resolve: (parent) => parent.commission_percentage }
  })
});

// 2. Fundi Profile Type
const FundiProfileType = new GraphQLObjectType({
  name: 'FundiProfile',
  fields: () => ({
    userId: { type: GraphQLString, resolve: (parent) => parent.user_id },
    fullName: { type: GraphQLString, resolve: (parent) => parent.full_name },
    profilePictureUrl: { type: GraphQLString, resolve: (parent) => parent.profile_picture_url },
    professionName: { type: GraphQLString, resolve: (parent) => parent.profession_name },
    bio: { type: GraphQLString },
    experienceYears: { type: GraphQLInt, resolve: (parent) => parent.experience_years },
    startingPrice: { type: GraphQLFloat, resolve: (parent) => parent.starting_price || parent.hourly_rate },
    onlineStatus: { type: GraphQLBoolean, resolve: (parent) => parent.online_status },
    verifiedBadge: { type: GraphQLBoolean, resolve: (parent) => parent.verified_badge },
    averageRating: { type: GraphQLFloat, resolve: (parent) => parent.average_rating },
    completedJobs: { type: GraphQLInt, resolve: (parent) => parent.completed_jobs },
    subscriptionPlan: { type: GraphQLString, resolve: (parent) => parent.subscription_plan }
  })
});

// 3. Booking Type
const BookingType = new GraphQLObjectType({
  name: 'Booking',
  fields: () => ({
    id: { type: GraphQLString },
    customerId: { type: GraphQLString, resolve: (parent) => parent.customer_id },
    fundiId: { type: GraphQLString, resolve: (parent) => parent.fundi_id },
    date: { type: GraphQLString },
    time: { type: GraphQLString },
    address: { type: GraphQLString },
    description: { type: GraphQLString },
    status: { type: GraphQLString },
    servicePrice: { type: GraphQLFloat, resolve: (parent) => parent.service_price },
    isEmergency: { type: GraphQLBoolean, resolve: (parent) => parent.is_emergency }
  })
});

// 4. Wallet Transaction Type
const TransactionType = new GraphQLObjectType({
  name: 'Transaction',
  fields: () => ({
    id: { type: GraphQLString },
    amount: { type: GraphQLFloat },
    type: { type: GraphQLString },
    status: { type: GraphQLString },
    description: { type: GraphQLString },
    createdAt: { type: GraphQLString, resolve: (parent) => parent.created_at }
  })
});

// 5. Wallet Type
const WalletType = new GraphQLObjectType({
  name: 'Wallet',
  fields: () => ({
    id: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    currency: { type: GraphQLString },
    transactions: {
      type: new GraphQLList(TransactionType),
      resolve: async (parent) => {
        const res = await db.query(
          'SELECT * FROM wallet_transactions WHERE wallet_id = $1 ORDER BY created_at DESC',
          [parent.id]
        );
        return res.rows;
      }
    }
  })
});

// Root Query
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    professions: {
      type: new GraphQLList(ProfessionType),
      resolve: async () => {
        const res = await db.query('SELECT * FROM professions WHERE is_active = true');
        return res.rows;
      }
    },
    fundis: {
      type: new GraphQLList(FundiProfileType),
      args: {
        professionId: { type: GraphQLString }
      },
      resolve: async (parent, args) => {
        let query = `
          SELECT fp.*, u.full_name, u.profile_picture_url, p.name_en as profession_name
          FROM fundi_profiles fp
          JOIN users u ON fp.user_id = u.id
          JOIN professions p ON fp.profession_id = p.id
          WHERE u.status = 'active'
        `;
        const params: unknown[] = [];
        if (args.professionId) {
          params.push(args.professionId);
          query += ` AND fp.profession_id = $1`;
        }
        const res = await db.query(query, params);
        return res.rows;
      }
    },
    wallet: {
      type: WalletType,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (parent, args) => {
        const res = await db.query('SELECT * FROM wallets WHERE user_id = $1', [args.userId]);
        return res.rows[0] || null;
      }
    }
  }
});

// Root Mutation
const RootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createBooking: {
      type: BookingType,
      args: {
        customerId: { type: new GraphQLNonNull(GraphQLString) },
        fundiId: { type: new GraphQLNonNull(GraphQLString) },
        professionId: { type: new GraphQLNonNull(GraphQLString) },
        date: { type: new GraphQLNonNull(GraphQLString) },
        time: { type: new GraphQLNonNull(GraphQLString) },
        address: { type: new GraphQLNonNull(GraphQLString) },
        servicePrice: { type: new GraphQLNonNull(GraphQLFloat) },
        description: { type: GraphQLString },
        isEmergency: { type: GraphQLBoolean }
      },
      resolve: async (parent, args) => {
        const res = await db.query(
          `INSERT INTO bookings (customer_id, fundi_id, profession_id, date, time, address, service_price, description, is_emergency, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending') RETURNING *`,
          [
            args.customerId,
            args.fundiId,
            args.professionId,
            args.date,
            args.time,
            args.address,
            args.servicePrice,
            args.description || '',
            args.isEmergency || false
          ]
        );
        return res.rows[0];
      }
    }
  }
});

export const graphqlSchema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation
});
