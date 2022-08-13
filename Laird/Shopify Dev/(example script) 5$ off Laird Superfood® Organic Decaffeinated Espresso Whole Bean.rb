Input.cart.line_items.each do |line_item|
  product = line_item.variant.product
  next if product.gift_card?
  next unless product.id == 6382402241
  line_item.change_line_price(line_item.line_price - Money.new(cents: 500), message: "My Sale")
end

Output.cart = Input.cart
