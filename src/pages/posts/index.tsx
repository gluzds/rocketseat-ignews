import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { prismicClient } from '../../services/prismic';
import styles from './styles.module.scss';

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
}

interface PostProps {
  posts: Post[]
}

export default function Posts({ posts }: PostProps) {
  return (
    <>
      <Head>
        <title>Post | Ignews</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link href={`/posts/${post.slug}`} key={post.slug}>
              <a>
                <time>{post.updatedAt}</time>
                <strong>{post.title}</strong>
                <p>{post.excerpt}</p>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await prismicClient.getByType('publication', {
    fetch: ['publication.title', 'publication.content'],
    pageSize: 100
  })

  const posts = response.results?.map(post => {
    return {
      slug: post.uid,
      title: post.data.title,
      excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
      updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    };
  });

  return {
    props: {
      posts
    }
  }
}