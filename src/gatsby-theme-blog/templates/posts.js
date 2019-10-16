import React from "react"
import { graphql } from 'gatsby';

import Posts from "../components/posts"

export default ({
  pathContext: { posts: allPosts, siteTitle, socialLinks, tags, tag },
  location,
  data: { mdxPages: { edges: posts = [] } = {} } = {},
}) => (
    <Posts
      location={location}
      tags={tags}
      posts={tag ? posts : allPosts}
      siteTitle={siteTitle}
      socialLinks={socialLinks}
    />
  )

export const pageQuery = graphql`
  query($tag: [String]) {
    mdxPages: allBlogPost(
      sort: { fields: [date, title], order: DESC }
      filter: {
        tags: {
          in: $tag
        }
      },
      limit: 1000
    ) {
      edges {
        node {
          id
          excerpt
          slug
          title
          date(formatString: "MMMM DD, YYYY")
          tags
        }
      }
    }
  }
`