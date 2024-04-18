const asyncHandler = require("express-async-handler");
const axios = require("axios");
const ContentHistory = require("../models/ContentHistory.js");
const User = require("../models/User.js");

const openApiController = async (req, res, next) => {
  const { prompt } = req.body;
  console.log(prompt, "prompt");
  try {
    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        Authorization:`Bearer ${process.env.API_KEYS}`
        ,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-instruct",
        prompt,
        max_tokens: 150,
      }),
    });
    const data = await response.json();
    //also store the generets content in history to show user
    const histories=await  ContentHistory.create({
        user:req.user?._id,
        content:data.choices[0].text?.trim()
      

    });
    //also save id of generated content o user collection
    const user=await User.findById(req.user?.id);
    user.history.push(histories?._id);
    user.apiRequestCount+=1; //increase api count for every request
    await user.save();
    //  console.log(data.choices[0].text.trim());
      return res.status(200).json(data.choices[0].text.trim());
    
    
  } catch (error) {
    // console.log(error);
    next(error);
  }
};

module.exports = {
  openApiController,
};
