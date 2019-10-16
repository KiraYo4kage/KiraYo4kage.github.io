import React, { Fragment } from "react"
import { Link } from "gatsby"
import { Styled, css } from "theme-ui"

export default ({ tags }) => (
  <Fragment>
    <div css={css({ mb: 3 })}>
      {
        tags.map((tag, index) => <Fragment key={tag}>
          {0 === index && (
            <Fragment>
              <Styled.a as={Link} to={`/`}>全部</Styled.a>
              {` `}&bull;{` `}
            </Fragment>
          )}
          <Styled.a as={Link} to={`/${tag}`}>{tag}</Styled.a>
          {tags.length - 1 !== index && (
            <Fragment>
              {` `}&bull;{` `}
            </Fragment>
          )}
        </Fragment>)
      }
    </div>
  </Fragment>
)

