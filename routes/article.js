const express = require('express');
const router = express.Router();
const fetchContent = require('../lib/fetchContent');
const debug = require('debug')('routes:article');
const extractText = require('../utils/extract-text');

router.get('/:uuid', (req, res) => {
  const uuid = req.params.uuid;
  return fetchContent.getArticle(uuid)
  .then(content => {
    const phrases = [];
    const context = [];
    phrases.push(
      {'type': 'Title', text: content.title},
      {'type': 'Standfirst', text: content.standfirst}
    );

    const type = content.annotations.find(object => {
      return object.type === 'GENRE'
    });
    const text = extractText(content.bodyXML);

    if( type ){
      if (type.prefLabel === 'News') {
        const first = text.match(/(^.*?[a-z]{2,}[.!?])\s+\W*[A-Z]/)[1];
        phrases.push({'type': 'First sentence', text: first});
      }
      context.push({'type': 'GENRE', text: type.prefLabel });
    } else {
      context.push({'type': 'GENRE', text: 'unknown' });
    }

    // <pull-quote><pull-quote-text><p>Whatever we do as we return land to indigenous owners, the economy must not be harmed, agricultural production must not <br/>go down</p></pull-quote-text></pull-quote>
    const pqMatches = content.bodyXML.match(/<pull-quote>(.*?)<\/pull-quote>/g);
    const pullQuotes = [];
    if (pqMatches) {
      pqMatches.map( pqm => {
        const pqtMatch = pqm.match(/<pull-quote-text>(.*)<\/pull-quote-text>/);
        if (pqtMatch) {
          const pqt = extractText(pqtMatch[1]);
          pullQuotes.push( pqt );
        }
      })

      pullQuotes.map((pq, i) => {
        phrases.push({'type': `PullQuote${i+1}`, text: pq });
      })
    }

    return res.render('index', {
        content,
        template: 'article',
        phrases,
        context,
        text,
        bodyXML: content.bodyXML,
        uuid,
        url: `https://www.ft.com/content/${uuid}`
      })
  })
  .catch(err => {
    res.status(400).send( debug(err) ).end();
  });
});

module.exports = router;
