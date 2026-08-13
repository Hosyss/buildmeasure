from pathlib import Path

page = Path('app/guides/how-many-bricks-do-i-need/page.tsx')
text = page.read_text()
old = '''              <p>
                For one documented example, BIA Technical Note 10 Table 4 lists
                <strong> 675 Modular bricks per 100 ft²</strong> for its running-
                or stack-bond estimating basis. That is 6.75 bricks per ft²
                before waste.
              </p>
              <a className="button button-primary guide-primary-action" href="/brick-calculator">
                Calculate my brick wall
              </a>'''
new = '''              <a className="button button-primary guide-primary-action" href="/brick-calculator">
                Calculate my brick wall
              </a>
              <p>
                For one documented example, BIA Technical Note 10 Table 4 lists
                <strong> 675 Modular bricks per 100 ft²</strong> for its running-
                or stack-bond estimating basis. That is 6.75 bricks per ft²
                before waste.
              </p>'''
if old not in text:
    raise SystemExit('Brick quick-answer CTA target not found')
page.write_text(text.replace(old, new, 1))

css = Path('app/globals.css')
text = css.read_text()
text = text.replace('''.guide-hero.utility-page-hero {
  padding-block: 62px;
}

.guide-hero .breadcrumbs {
  margin-bottom: 32px;
}

.guide-hero h1 {
  font-size: clamp(2.7rem, 5vw, 4.25rem);
}''', '''.guide-hero.utility-page-hero {
  padding-block: 52px;
}

.guide-hero .breadcrumbs {
  margin-bottom: 24px;
}

.guide-hero h1 {
  font-size: clamp(2.6rem, 5vw, 4rem);
}

.guide-article {
  padding-top: 56px;
}''', 1)
text = text.replace('''@media (max-width: 680px) {
  .guide-hero.utility-page-hero {
    padding-block: 42px;
  }

  .guide-hero .breadcrumbs {
    margin-bottom: 24px;
  }

  .guide-hero h1 {
    font-size: clamp(2.35rem, 11vw, 3.35rem);
  }
}''', '''@media (max-width: 680px) {
  .guide-hero.utility-page-hero {
    padding-block: 36px;
  }

  .guide-hero .breadcrumbs {
    margin-bottom: 18px;
  }

  .guide-hero h1 {
    font-size: clamp(2.25rem, 10.5vw, 3.15rem);
  }

  .guide-article {
    padding-top: 38px;
  }
}''', 1)
css.write_text(text)
