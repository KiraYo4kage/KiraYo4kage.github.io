const fs = require(`fs`)
const path = require(`path`)
const mkdirp = require(`mkdirp`)
const crypto = require(`crypto`)
const Debug = require(`debug`)
const { urlResolve } = require(`gatsby-core-utils`)

const debug = Debug(`gatsby-theme-blog`)

// These are customizable theme options we only need to check once
let basePath
let contentPath
let assetPath

// These templates are simply data-fetching wrappers that import components
const PostTemplate = require.resolve(`gatsby-theme-blog/src/templates/post`)
const PostsTemplate = require.resolve(`./src/gatsby-theme-blog/templates/posts`)

// create a set to reserve all posts' tags
let tagSet = new Set()
// create a list to reserve all legal posts
let legalPosts = [];

// Ensure that content directories exist at site-level
exports.onPreBootstrap = ({ store }, themeOptions) => {
  const { program } = store.getState()

  basePath = themeOptions.basePath || `/`
  contentPath = themeOptions.contentPath || `content/posts`
  assetPath = themeOptions.assetPath || `content/assets`

  const dirs = [
    path.join(program.directory, contentPath),
    path.join(program.directory, assetPath),
  ]

  dirs.forEach(dir => {
    debug(`Initializing ${dir} directory`)
    if (!fs.existsSync(dir)) {
      mkdirp.sync(dir)
    }
  })
}

const mdxResolverPassthrough = fieldName => async (
  source,
  args,
  context,
  info
) => {
  const type = info.schema.getType(`Mdx`)
  const mdxNode = context.nodeModel.getNodeById({
    id: source.parent,
  })
  const resolver = type.getFields()[fieldName].resolve
  const result = await resolver(mdxNode, args, context, {
    fieldName,
  })
  return result
}
exports.sourceNodes = ({ actions, schema }) => {
  const { createTypes } = actions
  createTypes(
    schema.buildObjectType({
      name: `ContentPost`,
      fields: {
        id: { type: `ID!` },
        title: {
          type: `String!`,
        },
        slug: {
          type: `String!`,
        },
        date: { type: `Date`, extensions: { dateformat: {} } },
        tags: { type: `[String]!` },
        keywords: { type: `[String]!` },
        excerpt: {
          type: `String!`,
          args: {
            pruneLength: {
              type: `Int`,
              defaultValue: 140,
            },
          },
          resolve: mdxResolverPassthrough(`excerpt`),
        },
        body: {
          type: `String!`,
          resolve: mdxResolverPassthrough(`body`),
        },
      },
      interfaces: [`Node`],
    })
  )
}

exports.createPages = async ({ graphql, actions, reporter }, { path }) => {
  const { createPage, deletePage } = actions
  console.log('deletepage is :', deletePage)
  console.log('path is :', path)
  const result = await graphql(`
    {
      site {
        siteMetadata {
          title
          social {
            name
            url
          }
        }
      }
      mdxPages: allBlogPost(
        sort: { fields: [date, title], order: DESC }
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
  `)

  if (result.errors) {
    reporter.panic(result.errors)
  }

  // Create Posts and Post pages.
  const {
    mdxPages,
    site: { siteMetadata },
  } = result.data
  const posts = mdxPages.edges
  const { title: siteTitle, social: socialLinks } = siteMetadata

  // Create a page for each Post
  legalPosts = posts.filter(({ node: post }) => {
    const { slug, tags } = post;
    if (tags.includes('banned')) {
      deletePage({
        path: slug,
        component: PostTemplate,
      })
      return false;
    }
    return true;
  })

  legalPosts.forEach(({ node: post }, index) => {
    const previous = index === legalPosts.length - 1 ? null : legalPosts[index + 1]
    const next = index === 0 ? null : legalPosts[index - 1]
    const { slug, tags } = post
    tags.forEach(tagSet.add.bind(tagSet))
    createPage({
      path: slug,
      component: PostTemplate,
      context: {
        ...post,
        siteTitle,
        socialLinks,
        previous,
        next,
      },
    })
  })

  // // Create the Posts page
  const tagArr = Array.from(tagSet)
  tagArr.forEach((tag) => {
    createPage({
      path: `${basePath}${tag}`,
      component: PostsTemplate,
      context: {
        posts,
        siteTitle,
        socialLinks,
        tags: tagArr,
        tag,
      },
    })
  })
  return result
}

// Create fields for post slugs and source
// This will change with schema customization with work
exports.onCreateNode = ({ node, actions, getNode, createNodeId }) => {
  const { createNode, createParentChildLink } = actions

  const toPostPath = node => {
    const { dir } = path.parse(node.relativePath)
    return urlResolve(basePath, dir, node.name)
  }

  // Make sure it's an MDX node
  if (node.internal.type !== `Mdx`) {
    return
  }

  // Create source field (according to contentPath)
  const fileNode = getNode(node.parent)
  const source = fileNode.sourceInstanceName

  if (node.internal.type === `Mdx` && source === contentPath) {
    const slug = toPostPath(fileNode)

    const fieldData = {
      title: node.frontmatter.title,
      tags: node.frontmatter.tags || [],
      slug,
      date: node.frontmatter.date,
    }
    createNode({
      ...fieldData,
      // Required fields.
      id: createNodeId(`${node.id} >>> BlogPost`),
      parent: node.id,
      children: [],
      internal: {
        type: `ContentPage`,
        contentDigest: crypto
          .createHash(`md5`)
          .update(JSON.stringify(fieldData))
          .digest(`hex`),
        content: JSON.stringify(fieldData),
        description: `Blog Posts`,
      },
    })
    createParentChildLink({ parent: fileNode, child: node })
  }
}

exports.onCreatePage = async ({ page, actions }) => {
  const { createPage, deletePage } = actions
  const { path } = page;
  if (path === basePath) {
    console.log(page, tagSet)
    deletePage(page)
    // You can access the variable "house" in your page queries now
    createPage({
      ...page,
      context: {
        ...page.context,
        posts: legalPosts,
        tags: Array.from(tagSet),
      },
    })
  }
}
