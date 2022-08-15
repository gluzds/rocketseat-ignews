import { render, screen } from '@testing-library/react';
import { prismicClient } from '../../services/prismic';
import Post, { getServerSideProps } from '../../pages/posts/[slug]';
import { getSession } from 'next-auth/react';

const post = {
  slug: 'my-new-post',
  title: 'My New Post',
  content: '<p>Post excerpt</p>',
  updatedAt: '10 de Abril'
};

jest.mock('next-auth/react')
jest.mock('../../services/prismic', () => {
  return {
    prismicClient: {
      getByUID: jest.fn(),
    },
  };
});

describe('Post page', () => {
  it('renders correctly', () => {
    render(<Post post={post} />)

    expect(screen.getByText("My New Post")).toBeInTheDocument();
    expect(screen.getByText("Post excerpt")).toBeInTheDocument();
  });

  it('redirects user if no subscription is found', async () => {
    const getSessionMocked = jest.mocked(getSession);

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: null,
    } as any)

    const response = await getServerSideProps({ params: { slug: 'my-new-post' } } as any);

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: '/',
        })
      })
    );
  });

  it('loads initial data', async () => {
    const getSessionMocked = jest.mocked(getSession);
    const getPrismicClientMocked = jest.mocked(prismicClient);

    getPrismicClientMocked.getByUID.mockReturnValueOnce({
      data: {
        title: "Fake title 1",
        content: [
          { type: "paragraph", text: "Fake excerpt 1" }
        ],
      },
      last_publication_date: "2022-04-22T03:00:00.000Z",
    } as any)

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-active-subscription',
    } as any)

    const response = await getServerSideProps({ params: { slug: 'my-new-post' } } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-new-post',
            title: 'Fake title 1',
            content: '<p>Fake excerpt 1</p>',
            updatedAt: '22 de abril de 2022'
          }
        }
      })
    );
  })
});