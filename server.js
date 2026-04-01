const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
// ================= PRODUCTS =================

// GET PRODUCTS
app.get("/products", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.log("GET PRODUCTS ERROR:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (err) {
    console.log("SERVER GET PRODUCTS ERROR:", err);
    res.status(500).json({ error: "Server error while fetching products" });
  }
});

// ADD PRODUCT
app.post("/products", upload.single("image"), async (req, res) => {
  try {
    let { name, price, minQuantity, description } = req.body;

    name = (name || "").trim();
    description = (description || "").trim();
    price = Number(price);
    minQuantity = Number(minQuantity);

    if (!name || Number.isNaN(price) || Number.isNaN(minQuantity)) {
      return res.status(400).json({ error: "Invalid product البيانات" });
    }

    let imageUrl = null;

    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;

      const uploadResult = await supabase.storage
        .from("products")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (uploadResult.error) {
        console.log("UPLOAD ERROR:", uploadResult.error);
        return res.status(500).json({ error: uploadResult.error.message });
      }

      const { data: publicUrlData } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name,
          price,
          min_quantity: minQuantity,
          description,
          image_url: imageUrl,
        },
      ])
      .select();

    if (error) {
      console.log("INSERT ERROR:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.log("SERVER ADD PRODUCT ERROR:", err);
    res.status(500).json({ error: "Server crash while adding product" });
  }
});

// UPDATE PRODUCT
app.put("/products/:id", async (req, res) => {
  try {
    let { name, price, minQuantity, description } = req.body;

    name = (name || "").trim();
    description = (description || "").trim();
    price = Number(price);
    minQuantity = Number(minQuantity);

    if (!name || Number.isNaN(price) || Number.isNaN(minQuantity)) {
      return res.status(400).json({ error: "Invalid product data" });
    }

    const { data, error } = await supabase
      .from("products")
      .update({
        name,
        price,
        min_quantity: minQuantity,
        description,
      })
      .eq("id", req.params.id)
      .select();

    if (error) {
      console.log("UPDATE ERROR:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.log("SERVER UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ error: "Server crash while updating product" });
  }
});

// DELETE PRODUCT
app.delete("/products/:id", async (req, res) => {
  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", req.params.id);

    if (error) {
      console.log("DELETE ERROR:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (err) {
    console.log("SERVER DELETE PRODUCT ERROR:", err);
    res.status(500).json({ error: "Server crash while deleting product" });
  }
});

// ================= ORDERS =================

// CREATE ORDER
app.post("/orders", async (req, res) => {
  try {
    let { product_name, quantity, price } = req.body;

    product_name = (product_name || "").trim();
    quantity = Number(quantity);
    price = Number(price);

    if (!product_name || Number.isNaN(quantity) || quantity <= 0 || Number.isNaN(price)) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    const { data, error } = await supabase
      .from("orders")
      .insert([{ product_name, quantity, price }])
      .select();

    if (error) {
      console.log("CREATE ORDER ERROR:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.log("SERVER CREATE ORDER ERROR:", err);
    res.status(500).json({ error: "Server crash while creating order" });
  }
});

// GET ORDERS
app.get("/orders", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.log("GET ORDERS ERROR:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (err) {
    console.log("SERVER GET ORDERS ERROR:", err);
    res.status(500).json({ error: "Server crash while fetching orders" });
  }
});

// START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});