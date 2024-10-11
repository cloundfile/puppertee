import fastify from 'fastify';
import { getVideos } from '../components/server';

const app = fastify()

app.get('/api/videos', async (req, res) => {
  const query = req.query.search_query;
  const response = await getVideos(query)  
  return { response }
});

app.listen({
  host: '0.0.0.0',
  port: process.env.PORT ? Number(process.env.PORT) :  3000
})
.then(() => {
  console.log(`https://localhost:3000`)
});