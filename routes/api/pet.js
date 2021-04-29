/*
  Michael Chunko
  Dominick DiMaggio
  Marcus Simpkins
  Elijah Wendel
  CS 546A
  I pledge my honor that I have abided by the Stevens Honor System.
*/

const express = require("express"),
      router = express.Router(),
      data = require("../../data");

router.get('/:id', async (req, res) => {
  res.sendStatus(500).json({ error: 'TODO: implement' })
})


router.put('/:id', async (req, res) => {
  res.sendStatus(500).json({ error: 'TODO: implement' })
})

router.patch('/:id', async (req, res) => {
  res.sendStatus(500).json({ error: 'TODO: implement' })
})

router.delete('/:id', async (req, res) => {
  res.sendStatus(500).json({ error: 'TODO: implement' })
})

router.post('/:id/interactions/feed', async (req, res) => {
  res.sendStatus(500).json({ error: 'TODO: implement' })
})

router.post('/:id/interactions/fetch', async (req, res) => {
  res.sendStatus(500).json({ error: 'TODO: implement' })
})

module.exports = router
