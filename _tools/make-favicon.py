"""Generate the site favicon set from images/west_coast_bias_logo.png."""
from PIL import Image

SRC = "images/west_coast_bias_logo.png"
PAD = 0.04  # breathing room around the artwork, as a fraction of the square side

src = Image.open(SRC).convert("RGBA")

# Trim to the solid artwork. A threshold of 128 excludes a faint near-transparent
# artifact below the island that would otherwise force ~160px of empty space.
mask = src.getchannel("A").point(lambda v: 255 if v > 128 else 0)
art = src.crop(mask.getbbox())

# Center the artwork on a transparent square so no axis gets squashed.
side = int(round(max(art.size) * (1 + 2 * PAD)))
square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
square.paste(art, ((side - art.width) // 2, (side - art.height) // 2), art)


def resize(size):
    return square.resize((size, size), Image.LANCZOS)


# Classic multi-resolution .ico — browsers request /favicon.ico unprompted.
resize(48).save("favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])

# Modern PNG icons.
resize(16).save("images/favicon-16.png", optimize=True)
resize(32).save("images/favicon-32.png", optimize=True)

# iOS renders transparency as black, so flatten onto white to match how the
# logo already reads against the nav bar.
touch = Image.new("RGBA", (180, 180), (255, 255, 255, 255))
icon = resize(180)
touch.paste(icon, (0, 0), icon)
touch.convert("RGB").save("images/apple-touch-icon.png", optimize=True)

print(f"source bbox {mask.getbbox()} -> square {side}px")
