import { render, screen } from '@testing-library/react';
import { prismicClient } from '../../services/prismic';
import Posts, { Post, getStaticProps } from '../../pages/posts';
import { debug } from 'console';

const posts = [
  { slug: 'my-new-post', title: 'My New Post', excerpt: 'Post excerpt', updatedAt: '10 de Abril' }
] as Post[];

jest.mock("../../services/prismic", () => {
  return {
    prismicClient: {
      getByType: jest.fn(),
    },
  };
});

describe('Posts page', () => {
  it('renders correctly', () => {
    render(<Posts posts={posts} />)
    const getPrismicClientMocked = jest.mocked(prismicClient);

    getPrismicClientMocked.getByType.mockResolvedValue({
      data: posts,
    } as any);

    expect(screen.getByText("My New Post")).toBeInTheDocument();
  });

  it("loads initial data", async () => {
    const getPrismicClientMocked = jest.mocked(prismicClient);

    getPrismicClientMocked.getByType.mockReturnValueOnce({
      results: [
        {
          uid: "fake-slug",
          data: {
            title: "Fake title 1",
            content: [
              { type: "paragraph", text: "Fake excerpt 1" }
            ],
          },
          last_publication_date: "2022-04-22T03:00:00.000Z",
        }
      ]
    } as any);
    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [
            {
              slug: "fake-slug",
              title: "Fake title 1",
              excerpt: "Fake excerpt 1",
              updatedAt: "22 de abril de 2022",
            },
          ],
        },
      })
    );
  });
});