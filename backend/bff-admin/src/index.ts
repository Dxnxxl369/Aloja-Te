import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const typeDefs = `#graphql
  type Usuario {
    id: ID!
    nombre: String!
    email: String!
    rol: String!
  }

  type MetricasAdmin {
    totalUsuarios: Int!
    totalAlojamientos: Int!
    totalReservasActivas: Int!
    ingresosMesBOB: Float!
  }

  type Query {
    metricasGenerales: MetricasAdmin
    usuariosPendientesAprobacion: [Usuario]
  }
`;

const resolvers = {
  Query: {
    metricasGenerales: () => ({
      totalUsuarios: 120,
      totalAlojamientos: 45,
      totalReservasActivas: 28,
      ingresosMesBOB: 45800.00
    }),
    usuariosPendientesAprobacion: () => []
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function start() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: Number(process.env.PORT) || 4000 },
  });
  console.log(`[BFF Admin GraphQL] Listo en: ${url}`);
}

start();
