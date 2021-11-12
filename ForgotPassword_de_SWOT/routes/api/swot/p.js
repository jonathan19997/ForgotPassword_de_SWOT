const express = require('express');
const router = express.Router();
const {
  getAll,
  addOne,
  addKeywords,
  deleteById
} = require('./examen.model');

router.get("/all", async (req, res, next)=>{
    try{
    const todo = await prueba.getAll(req.user._id);   
    res.status(200).json(rows);
    }catch(ex){
    return res.status(500).json({"msg":"Error"});
    }
  }
);

router.post("/new", async (req, res, next)=>{
    try{
      let docInserted = await addOne(codigo, observacion, mes, anio, dia, req.user._id);
      console.log(docInserted);
      res.status(200).json(docInserted);
    }catch(ex){
    return res.status(500).json({"msg":"Error"});
    }
  }
);

router.put("/addkeyword/:id", async (req, res, next)=>{
    try{
      const { id } = req.params;
      let result = await addKeyword(id, keyword);
      res.status(200).json(result);
    }catch(ex){
    return res.status(500).json({ "msg": "Error" });
    }
  }
);

router.delete("/del/:id", async (req, res, next) => {
    try {
    const {id} = req.params;
    const result = await Swot.deleteById(id);
    console.log(result);
     res.status(200).json(result);
    } catch (ex) {
    return res.status(500).json({ "msg": "Error" });
    }
  }
);
module.exports = router;