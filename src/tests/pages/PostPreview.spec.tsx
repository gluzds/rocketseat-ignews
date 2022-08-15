import { render, screen } from '@testing-library/react';
import { prismicClient } from '../../services/prismic';
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { debug } from 'console';

const post = {
  slug: 'my-new-post',
  title: 'My New Post',
  content: '<p>Post excerpt</p>',
  updatedAt: '10 de Abril'
};

jest.mock('next/router')
jest.mock('next-auth/react')
jest.mock('../../services/prismic', () => {
  return {
    prismicClient: {
      getByUID: jest.fn(),
    },
  };
});

describe('Post preview page', () => {
  it('renders correctly', () => {
    render(<Post post={post} />)

    expect(screen.getByText("My New Post")).toBeInTheDocument();
    expect(screen.getByText("Post excerpt")).toBeInTheDocument();
    expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument();
  });

  it('redirects user to post page when user is subscribed', async () => {
    const useSessionMocked = jest.mocked(useSession);
    const useRouterMocked = jest.mocked(useRouter);
    const pushMock = jest.fn();

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any)

    useSessionMocked.mockReturnValueOnce({
      data: {
        activeSubscription: 'fake-active-subscription',
        expires: null
      },
      status: 'authenticated'
    });

    render(<Post post={post} />)
    expect(pushMock).toHaveBeenCalledWith('/posts/my-new-post')
  });

  it('loads initial data', async () => {
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

    const response = await getStaticProps({ params: { slug: 'my-new-post' } })

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