"use client"

import { useState } from "react"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

interface Dish {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: File | null
  imagePreview: string | null
}

export default function RestaurantSetup() {
  const [restaurantName, setRestaurantName] = useState("")
  const [address, setAddress] = useState("")
  const [bannerImageURL, setBannerImageURL] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [dishes, setDishes] = useState<Dish[]>([
    {
      id: "1",
      name: "",
      description: "",
      price: 0,
      category: "",
      image: null,
      imagePreview: null,
    },
  ])

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBannerImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDishImageUpload = (dishId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setDishes((prevDishes) =>
          prevDishes.map((dish) =>
            dish.id === dishId
              ? { ...dish, image: file, imagePreview: reader.result as string }
              : dish
          )
        )
      }
      reader.readAsDataURL(file)
    }
  }

  const addDish = () => {
    const newDish: Dish = {
      id: Date.now().toString(),
      name: "",
      description: "",
      price: 0,
      category: "",
      image: null,
      imagePreview: null,
    }
    setDishes([...dishes, newDish])
  }

  const removeDish = (dishId: string) => {
    setDishes(dishes.filter((dish) => dish.id !== dishId))
  }

  const updateDish = (dishId: string, field: keyof Dish, value: any) => {
    setDishes((prevDishes) =>
      prevDishes.map((dish) => (dish.id === dishId ? { ...dish, [field]: value } : dish))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would send the data to your backend
    const formData = {
      restaurantName,
      address,
      bannerImage,
      dishes: dishes.map((dish) => ({
        name: dish.name,
        description: dish.description,
        price: dish.price,
        category: dish.category,
        image: dish.image,
      })),
    }
    console.log("Restaurant Profile Data:", formData)

    const response = await fetch("http://localhost:5000/api/restaurants", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    alert("Restaurant profile created! (Check console for data)")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-foreground">
            Set Up Your Restaurant Profile
          </h1>
          <p className="text-center text-muted-foreground text-lg mb-12">
            Create your restaurant profile and add dishes for customers to discover
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Restaurant Details Section */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Restaurant Details</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="restaurantName" className="text-foreground">
                    Restaurant Name
                  </Label>
                  <Input
                    id="restaurantName"
                    type="text"
                    placeholder="Enter your restaurant name"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-foreground">
                    Address
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Enter your restaurant address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>

                {/* Banner Image Upload */}
                <div>
                  <Label htmlFor="bannerImage" className="text-foreground">
                    Restaurant Banner Image
                  </Label>
                  <div className="mt-2">
                    <input
                      id="bannerImage"
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                    />
                  </div>
                  {bannerPreview && (
                    <div className="mt-4 relative w-full h-48 rounded-lg overflow-hidden border border-border">
                      <img
                        src={bannerPreview}
                        alt="Banner preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Menu & Dishes Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Menu Items</h2>
                <Button type="button" onClick={addDish} className="bg-primary text-primary-foreground">
                  + Add Dish
                </Button>
              </div>

              <div className="space-y-6">
                {dishes.map((dish, index) => (
                  <Card key={dish.id} className="p-6 bg-secondary/20 border-border">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">Dish #{index + 1}</h3>
                      {dishes.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeDish(dish.id)}
                          variant="destructive"
                          className="text-sm"
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`dish-name-${dish.id}`} className="text-foreground">
                          Dish Name
                        </Label>
                        <Input
                          id={`dish-name-${dish.id}`}
                          type="text"
                          placeholder="e.g., Margherita Pizza"
                          value={dish.name}
                          onChange={(e) => updateDish(dish.id, "name", e.target.value)}
                          required
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`dish-category-${dish.id}`} className="text-foreground">
                          Category
                        </Label>
                        <Input
                          id={`dish-category-${dish.id}`}
                          type="text"
                          placeholder="e.g., Italian, Vegan"
                          value={dish.category}
                          onChange={(e) => updateDish(dish.id, "category", e.target.value)}
                          required
                          className="mt-2"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor={`dish-description-${dish.id}`} className="text-foreground">
                          Description
                        </Label>
                        <Input
                          id={`dish-description-${dish.id}`}
                          type="text"
                          placeholder="Brief description of the dish"
                          value={dish.description}
                          onChange={(e) => updateDish(dish.id, "description", e.target.value)}
                          required
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`dish-price-${dish.id}`} className="text-foreground">
                          Price ($)
                        </Label>
                        <Input
                          id={`dish-price-${dish.id}`}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={dish.price || ""}
                          onChange={(e) => updateDish(dish.id, "price", parseFloat(e.target.value))}
                          required
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`dish-image-${dish.id}`} className="text-foreground">
                          Dish Image
                        </Label>
                        <input
                          id={`dish-image-${dish.id}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleDishImageUpload(dish.id, e)}
                          className="mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/90 cursor-pointer"
                        />
                      </div>

                      {dish.imagePreview && (
                        <div className="md:col-span-2">
                          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                            <img
                              src={dish.imagePreview}
                              alt={`${dish.name} preview`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button
                type="submit"
                className="px-12 py-6 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Create Restaurant Profile
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
