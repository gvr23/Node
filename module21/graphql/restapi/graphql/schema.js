const { buildSchema } = require('graphql')

module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User
        createdAt: String!
        updatedAt: String!
    }
    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        posts: [Post]
    }
    type AuthData {
        token: String!
        userId: String!
    }

    type PostData {
        posts: [Post]!
        totalPosts: Int!
    }
    input UserData {
        email: String!
        name: String!
        password: String!
    }
    input PostInputData {
        title: String!
        content: String!
        imageUrl: String!
    }

    type RootQuery {
        login(email: String!, password: String!): AuthData!
        getPosts(page: Int!): PostData!
        getPost(postId: ID!): Post!
        getUserStatus: User!
    }

    type RootMutation {
        createUser(userInput: UserData): User
        createPost(postInput: PostInputData): Post!
        editPost(postId: ID!, postInput: PostInputData): Post!
        deletePost(postId: ID!): Boolean!
        updateUserStatus(newStatus: String!): Boolean!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`)