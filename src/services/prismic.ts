import * as prismic from '@prismicio/client'

export const repositoryName = 'ignews-glds'

export const prismicClient = prismic.createClient(repositoryName, {
  accessToken: process.env.PRISMIC_ACCESS_TOKEN,
})