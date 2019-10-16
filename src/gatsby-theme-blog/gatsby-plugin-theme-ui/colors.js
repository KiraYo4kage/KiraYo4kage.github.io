import merge from "deepmerge"
import defaultThemeColors from "gatsby-theme-blog/src/gatsby-plugin-theme-ui/colors"

/*
 * Want to change your theme colors?
 * Try uncommenting the color overrides below
 * to go from default purple to a blue theme
 */

// const darkBlue = `#007acc`
// const lightBlue = `#66E0FF`
// const blueGray = `#282c35`

const pink60 = `#d23669`
const pink30 = `#FFA7C4`

export default merge(defaultThemeColors, {
  primary: pink60,
  modes: {
    dark: {
      primary: pink30,
    },
  },
  // text: blueGray,
  // primary: darkBlue,
  // heading: blueGray,
  // modes: {
  //   dark: {
  //     background: blueGray,
  //     primary: lightBlue,
  //     highlight: lightBlue,
  //   },
  // },
})
