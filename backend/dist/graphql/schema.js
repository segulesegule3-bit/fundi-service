"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphqlSchema = void 0;
const graphql_1 = require("graphql");
const db_1 = require("../db");
// 1. Profession Type
const ProfessionType = new graphql_1.GraphQLObjectType({
    name: 'Profession',
    fields: () => ({
        id: { type: graphql_1.GraphQLString },
        nameEn: { type: graphql_1.GraphQLString, resolve: (parent) => parent.name_en },
        nameSw: { type: graphql_1.GraphQLString, resolve: (parent) => parent.name_sw },
        description: { type: graphql_1.GraphQLString },
        iconName: { type: graphql_1.GraphQLString, resolve: (parent) => parent.icon_name },
        commissionPercentage: { type: graphql_1.GraphQLFloat, resolve: (parent) => parent.commission_percentage }
    })
});
// 2. Fundi Profile Type
const FundiProfileType = new graphql_1.GraphQLObjectType({
    name: 'FundiProfile',
    fields: () => ({
        userId: { type: graphql_1.GraphQLString, resolve: (parent) => parent.user_id },
        fullName: { type: graphql_1.GraphQLString, resolve: (parent) => parent.full_name },
        profilePictureUrl: { type: graphql_1.GraphQLString, resolve: (parent) => parent.profile_picture_url },
        professionName: { type: graphql_1.GraphQLString, resolve: (parent) => parent.profession_name },
        bio: { type: graphql_1.GraphQLString },
        experienceYears: { type: graphql_1.GraphQLInt, resolve: (parent) => parent.experience_years },
        startingPrice: { type: graphql_1.GraphQLFloat, resolve: (parent) => parent.starting_price || parent.hourly_rate },
        onlineStatus: { type: graphql_1.GraphQLBoolean, resolve: (parent) => parent.online_status },
        verifiedBadge: { type: graphql_1.GraphQLBoolean, resolve: (parent) => parent.verified_badge },
        averageRating: { type: graphql_1.GraphQLFloat, resolve: (parent) => parent.average_rating },
        completedJobs: { type: graphql_1.GraphQLInt, resolve: (parent) => parent.completed_jobs },
        subscriptionPlan: { type: graphql_1.GraphQLString, resolve: (parent) => parent.subscription_plan }
    })
});
// 3. Booking Type
const BookingType = new graphql_1.GraphQLObjectType({
    name: 'Booking',
    fields: () => ({
        id: { type: graphql_1.GraphQLString },
        customerId: { type: graphql_1.GraphQLString, resolve: (parent) => parent.customer_id },
        fundiId: { type: graphql_1.GraphQLString, resolve: (parent) => parent.fundi_id },
        date: { type: graphql_1.GraphQLString },
        time: { type: graphql_1.GraphQLString },
        address: { type: graphql_1.GraphQLString },
        description: { type: graphql_1.GraphQLString },
        status: { type: graphql_1.GraphQLString },
        servicePrice: { type: graphql_1.GraphQLFloat, resolve: (parent) => parent.service_price },
        isEmergency: { type: graphql_1.GraphQLBoolean, resolve: (parent) => parent.is_emergency }
    })
});
// 4. Wallet Transaction Type
const TransactionType = new graphql_1.GraphQLObjectType({
    name: 'Transaction',
    fields: () => ({
        id: { type: graphql_1.GraphQLString },
        amount: { type: graphql_1.GraphQLFloat },
        type: { type: graphql_1.GraphQLString },
        status: { type: graphql_1.GraphQLString },
        description: { type: graphql_1.GraphQLString },
        createdAt: { type: graphql_1.GraphQLString, resolve: (parent) => parent.created_at }
    })
});
// 5. Wallet Type
const WalletType = new graphql_1.GraphQLObjectType({
    name: 'Wallet',
    fields: () => ({
        id: { type: graphql_1.GraphQLString },
        balance: { type: graphql_1.GraphQLFloat },
        currency: { type: graphql_1.GraphQLString },
        transactions: {
            type: new graphql_1.GraphQLList(TransactionType),
            resolve: async (parent) => {
                const res = await db_1.db.query('SELECT * FROM wallet_transactions WHERE wallet_id = $1 ORDER BY created_at DESC', [parent.id]);
                return res.rows;
            }
        }
    })
});
// Root Query
const RootQuery = new graphql_1.GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        professions: {
            type: new graphql_1.GraphQLList(ProfessionType),
            resolve: async () => {
                const res = await db_1.db.query('SELECT * FROM professions WHERE is_active = true');
                return res.rows;
            }
        },
        fundis: {
            type: new graphql_1.GraphQLList(FundiProfileType),
            args: {
                professionId: { type: graphql_1.GraphQLString }
            },
            resolve: async (parent, args) => {
                let query = `
          SELECT fp.*, u.full_name, u.profile_picture_url, p.name_en as profession_name
          FROM fundi_profiles fp
          JOIN users u ON fp.user_id = u.id
          JOIN professions p ON fp.profession_id = p.id
          WHERE u.status = 'active'
        `;
                const params = [];
                if (args.professionId) {
                    params.push(args.professionId);
                    query += ` AND fp.profession_id = $1`;
                }
                const res = await db_1.db.query(query, params);
                return res.rows;
            }
        },
        wallet: {
            type: WalletType,
            args: {
                userId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) }
            },
            resolve: async (parent, args) => {
                const res = await db_1.db.query('SELECT * FROM wallets WHERE user_id = $1', [args.userId]);
                return res.rows[0] || null;
            }
        }
    }
});
// Root Mutation
const RootMutation = new graphql_1.GraphQLObjectType({
    name: 'Mutation',
    fields: {
        createBooking: {
            type: BookingType,
            args: {
                customerId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                fundiId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                professionId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                date: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                time: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                address: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                servicePrice: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLFloat) },
                description: { type: graphql_1.GraphQLString },
                isEmergency: { type: graphql_1.GraphQLBoolean }
            },
            resolve: async (parent, args) => {
                const res = await db_1.db.query(`INSERT INTO bookings (customer_id, fundi_id, profession_id, date, time, address, service_price, description, is_emergency, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending') RETURNING *`, [
                    args.customerId,
                    args.fundiId,
                    args.professionId,
                    args.date,
                    args.time,
                    args.address,
                    args.servicePrice,
                    args.description || '',
                    args.isEmergency || false
                ]);
                return res.rows[0];
            }
        }
    }
});
exports.graphqlSchema = new graphql_1.GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation
});
