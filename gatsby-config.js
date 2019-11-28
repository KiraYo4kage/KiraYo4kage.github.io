module.exports = {
  pathPrefix: `/`,
  plugins: [
    {
      resolve: `gatsby-theme-blog`,
      options: {},
    },
    {
      resolve: 'gatsby-plugin-mdx',
      options: {
        gatsbyRemarkPlugins: [`gatsby-remark-images`, 'gatsby-remark-copy-linked-files'],
        plugins: [`gatsby-remark-images`, 'gatsby-remark-copy-linked-files'],
      }
    },
  ],
  // Customize your site metadata:
  siteMetadata: {
    title: `吉良吉影过不上平稳的生活`,
    author: `Kira Yo4kage`,
    description: `吉良吉影过不上平稳的生活`,
    social: [
      {
        name: `twitter`,
        url: `https://twitter.com/yyjqqw`,
      },
      {
        name: `instagram`,
        url: `https://www.instagram.com/kira_yo4kage`,
      },
      {
        name: `github`,
        url: `https://github.com/KiraYo4kage`,
      },
    ],
  },
}
