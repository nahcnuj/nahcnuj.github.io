import { css } from 'hono/css'
import type { FC } from 'hono/jsx'
import { createRoute } from 'honox/factory'
import GridSheetLayout from '../components/GridSheetLayout'
import PaperCard from '../components/PaperCard'
import RemoteImage from '../components/RemoteImage'

const Div: FC = ({ children }) => {
  return <div class={css`margin-block:1em`}>{children}</div>
}

export default createRoute((c) => {
  const title = 'Junichi Hayashi, a web engineer'
  const description = 'I am Junichi Hayashi, a web engineer.'

  const headingClass = css`
    height: 3em;
    margin-bottom: 1.5em;

    background: linear-gradient(to right, var(--theme-main-color) 0%, var(--theme-main-color) 50%, var(--theme-base-color) calc(100% - 3.1em));

    & span {
      display: inline-block;
    }
  `
  const headerImageClass = css`
    display: inline-block;
    float: right;
    height: 100%;
    background: var(--theme-base-color);

    & img {
      width: 100%;
      height: 100%;
      object-fit: scale-down;
    }
  `

  const headerTextClass = css`
    height: 100%;
    display:flex;
    flex-direction: column;
    justify-content: center;

    & > * {
      background: var(--theme-base-color);
    }

    & > *:nth-child(2) {
      font-size: 1.3rem;
      font-weight: normal;
    }
  `

  const linkAboutMeClass = css`
    display: inline-block;
    margin-inline-end: 1em;
    &:before {
      content: "➤ ";
    }
  `

  return c.render(
    <div class={css`padding-inline:0.2em`}>
      <h1 class={headingClass}>
        <div class={headerImageClass}>
          <RemoteImage src="/author.jpg" width={150} height={150} alt="" />
        </div>
        <div class={headerTextClass}>
          <div>Junichi Hayashi</div>
          <div>A web engineer</div>
        </div>
      </h1>

      <GridSheetLayout columns={3}>
        <PaperCard>
          <h2>Enjoy Programming</h2>
          <p lang="en">
            I've been learning programming languages like C/C++, Java, Perl, TypeScript, Rust, Lean, and more. I'm
            interested in semantics of programming languages and formal verification, and have been slowly working on
            developing{' '}
            <a href="https://github.com/nahcnuj/tibi" target="_blank" rel="noreferrer">
              a compiler for a small homemade programming language
            </a>{' '}
            in Lean 4, along with proofs of its compilation correctness.
          </p>
          <Div>
            <a href="/works/index.html" class={linkAboutMeClass}>
              Past works
            </a>
            <a href="https://github.com/nahcnuj" target="_blank" rel="noreferrer" class={linkAboutMeClass}>
              GitHub
            </a>
          </Div>
        </PaperCard>

        <PaperCard>
          <h2>Engineer Web Services</h2>
          <p lang="en">
            I have over 4 years of experience in developing web services built on the{' '}
            <abbr title="Linux, Apache, MySQL, Perl">LAMP</abbr> stack. I'm familiar with both on-premises and cloud
            environments like AWS. For a detailed overview of my professional experience, please see{' '}
            <a href="https://github.com/nahcnuj/nahcnuj/blob/main/CV.md" target="_blank" rel="noreferrer">
              my full CV
            </a>
            . I still want to work as a programmer because I want to engage in programming during the working hours that
            make up most of my life.
          </p>
          <Div>
            <a
              href="https://github.com/nahcnuj#junichi-hayashi"
              target="_blank"
              rel="noreferrer"
              class={linkAboutMeClass}
            >
              Resume
            </a>
            <a
              href="https://github.com/nahcnuj/nahcnuj/blob/main/CV.md"
              target="_blank"
              rel="noreferrer"
              class={linkAboutMeClass}
            >
              CV
            </a>
            (on GitHub)
          </Div>
        </PaperCard>

        <PaperCard>
          <h2>Refresh Myself with Music</h2>
          <p lang="en">
            I'm a big fan of Nao Toyama's music, having attended many of her live concerts and even joined a fan club
            bus tour in 2024. I deeply connect with the lyrics she sings, gaining daily strength from them. I like the
            sound of the piano and enjoy playing it to perform her songs apart from programming, though I'm still a
            beginner.
          </p>
        </PaperCard>
      </GridSheetLayout>
    </div>,
    { title, description, showHeaderAd: false },
  )
})
