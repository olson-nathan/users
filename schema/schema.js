const graphql = require('graphql');
const axios = require('axios');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql;

// specify the addr of our json server
const dbServer = "http://localhost:3000";

const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: {
            type: GraphQLString
        },
        name: {
            type: GraphQLString
        },
        description: {
            type: GraphQLString
        },
        users: {
            type: new GraphQLList(UserType),
            resolve(pv, args) {
                return axios.get(`${dbServer}/companies/${pv.id}/users`).then(resp => resp.data);
            }
        }
    })
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: {
            type: GraphQLString
        },
        firstName: {
            type: GraphQLString
        },
        age: {
            type: GraphQLInt
        },
        company: {
            type: CompanyType,
            resolve(pv, args) {
                return axios.get(`${dbServer}/companies/${pv.companyId}`).then(resp => resp.data);
            }
        }
    })
});


const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: {
                id: {
                    type: GraphQLString
                }
            },
            resolve(pv, args) {
                return axios.get(`${dbServer}/users/${args.id}`).then(resp => resp.data);
            }
        },
        company: {
            type: CompanyType,
            args: {
                id: {
                    type: GraphQLString
                }
            },
            resolve(pv, args) {
                return axios.get(`${dbServer}/companies/${args.id}`).then(resp => resp.data);
            }
        }
    }
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                firstName: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                age: {
                    type: new GraphQLNonNull(GraphQLInt)
                },
                companyId: {
                    type: GraphQLString
                }
            },
            resolve(pv, {
                firstName,
                age
            }) {
                return axios.post(`${dbServer}/users`, {
                    firstName,
                    age
                }).then(resp => {
                    return resp.data
                });
            }
        },
        deleteUser: {
            type: UserType,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve(pv, {
                id
            }) {
                return axios.delete(`${dbServer}/users/${id}`).then(resp => resp.data);
            }
        },
        editUser: {
            type: UserType,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                firstName: {
                    type: GraphQLString
                },
                age: {
                    type: GraphQLInt
                },
                companyId: {
                    type: GraphQLString
                }
            },
            resolve(pv, args) {
                return axios.patch(`${dbServer}/users/${args.id}`, args).then(resp => {
                    return resp.data
                });
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    // this is es6 syntax for mutation: mutation
    mutation
});