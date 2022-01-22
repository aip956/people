const Express = require("express");

var { graphqlHTTP } = require('express-graphql');


const mongoose = require("mongoose");
require("dotenv").config();
const {
    GraphQLID,
    GraphQLString,
    GraphQLList,
    GraphQLType,
    GraphQLSchema,
    GraphQLNonNull,
    GraphQLObjectType
} = require ("graphql");

var app = Express();
var cors = require("cors");

// const { PORT = 4000, MONGODB_URL } = process.env;
const MONGODB_URL = process.env.MONGODB_URL

app.use(cors());

mongoose.connect(MONGODB_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  // Connection Events
  mongoose.connection
    .on("open", () => console.log("Your are connected to mongoose"))
    .on("close", () => console.log("Your are disconnected from mongoose"))
    .on("error", (error) => console.log(error));

const PersonModel = mongoose.model("person", {
    firstName: String,
    lastName: String
});

const PersonType = new GraphQLObjectType({
    name: "Person",
    fields: {
        id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString }
    }
});

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: "Query",
      fields: {
        // Query 1
  
        // name of the query, people
        people: {
          // the type of response this query will return, here PersonType
          type: GraphQLList(PersonType),
          // resolver is required
          resolve: (root, args, context, info) => {
            // we are returning all persons available in the table in mongodb
            return PersonModel.find().exec();
          },
        },
        // Query 2
        peopleByID: {
          // name of the query is people by id
          type: PersonType,
          args: {
            // strong validation for graphqlid, which is mendatory for running this query
            id: { type: GraphQLNonNull(GraphQLID) },
          },
          resolve: (root, args, context, info) => {
            return PersonModel.findById(args.id).exec();
          },
        },
        // Query 3
        peopleByName: {
          type: GraphQLList(PersonType),
          args: {
            firstName: { type: GraphQLString },
          },
          resolve: (root, args, context, info) => {
            return PersonModel.find({ firstName: args.firstName }).exec();
          },
        },
      },
    }),
  
    // Mutation 1
    mutation: new GraphQLObjectType({
      name: "Create",
      fields: {
        people: {
          type: PersonType,
          args: {
            firstName: { type: GraphQLString },
            lastName: { type: GraphQLString },
          },
          resolve: (root, args, context, info) => {
            var people = new PersonModel(args);
            return people.save();
          },
        },
      },
    }),

    // // Mutation 2
    // mutation: update(GraphQLObjectType({
    //   name: "Update",
    //   fields: {
    //     people: {
    //       type: PersonType,
    //       args: {
    //         firstName: { type: GraphQLString },
    //         lastName: { type: GraphQLString },
    //       },
    //       resolve: (root, args, context, info) => {
    //         var people = new PersonModel(args);
    //         return people.save();
    //       },
    //     },
    //   },
    // }),

    
  });





// Port details
app.use('/person', graphqlHTTP({
    schema: schema,

    graphiql: true,
  }));

app.listen(4000, () => {
    console.log("server running at 4000");
});