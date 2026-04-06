---
title: About Us
slug: /about
sections:
  - type: GenericSection
    title:
      text: About Sage & Paige
      color: text-dark
      type: TitleBlock
    subtitle: Two middle schoolers sharing their adventures with animals
    text: >
      Welcome to our corner of the internet! We're Sage and Paige — two friends 
      who decided to create this site to share pictures and stories about our pets.
      What started as a simple idea turned into a fun project where we can share
      our love for our furry friends.

      We're both in 7th grade at Northwest School and share a passion for music
      and theatre. When we're not posting about cats, you can find us practicing
      our instruments or rehearsing for the next show with Broadway Bound
      Children's Theatre.
    actions: []
    media:
      type: ImageBlock
      url: /images/Fitz2.jpg
      altText: Fitz the cat
      styles:
        self:
          borderRadius: medium
    colors: bg-light-fg-dark
    styles:
      self:
        alignItems: center
        flexDirection: row
        padding:
          - pt-16
          - pl-16
          - pr-16
          - pb-16
  - type: FeaturedPeopleSection
    title:
      text: Meet the Team
      color: text-dark
      type: TitleBlock
    people:
      - content/data/person1.json
      - content/data/person2.json
    variant: two-col-grid
    colors: bg-neutral-fg-dark
    styles:
      self:
        padding:
          - pt-16
          - pl-16
          - pr-16
          - pb-16
        justifyContent: center
      subtitle:
        textAlign: center
seo:
  metaTitle: About Sage Waliczek & Paige Greenberg
  metaDescription: >-
    Meet Sage Waliczek and Paige Greenberg, two 7th graders from Northwest
    School sharing their adventures with cats and other fun stuff.
  socialImage: /images/Fitz1.jpg
  metaTags:
    - type: MetaTag
      property: 'author'
      content: 'Sage Waliczek'
    - type: MetaTag
      property: 'author'
      content: 'Paige Greenberg'
  type: Seo
type: PageLayout
---
