import type { Joke } from '@prisma/client';
import type { LinksFunction, LoaderFunction } from '@remix-run/node';
import { Outlet, Link, useLoaderData } from '@remix-run/react';

import stylesUrl from '~/styles/jokes.css';
import { db } from '~/utils/db.server';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: stylesUrl }];
};

type LoaderData = { jokeListItems: Array<Pick<Joke, 'id' | 'name'>> };
export let loader: LoaderFunction = async () => {
  let jokeListItems = await db.joke.findMany({
    take: 5,
    select: { id: true, name: true },
    orderBy: { createdAt: 'desc' }
  });
  // let jokeListItems = jokes.map(j => ({ id: j.id, name: j.name }))
  // console.log(jokeListItems);
  let data = { jokeListItems };
  return data;
};

export default function JokesRoute() {
  let data = useLoaderData<LoaderData>();
  return (
    <div className='jokes-layout'>
      <header className='jokes-header'>
        <div className='container'>
          <h1 className='home-link'>
            <Link to='/' title='Remix Jokes' aria-label='Remix Jokes'>
              <span className='logo'>🤪</span>
              <span className='logo-medium'>J🤪KES</span>
            </Link>
          </h1>
        </div>
      </header>
      <main className='jokes-main'>
        <div className='container'>
          <div className='jokes-list'>
            <Link to='.'>Get a random joke</Link>
            <p>Here are a few more jokes to check out:</p>
            <ul>
              {data.jokeListItems.map((j) => (
                <li key={j.id}>
                  <Link to={j.id}>{j.name}</Link>
                </li>
              ))}
              {/* <li>
                <Link to="some-joke-id">Hippo</Link>
              </li> */}
            </ul>
            <Link to='new' className='button'>
              Add your own
            </Link>
          </div>
          <div className='jokes-outlet'>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
