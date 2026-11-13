#!/bin/zsh
# Lighthouse (mobile and desktop) on the indexable pages, JSON + HTML reports in
# out/lh/. Needs a Chrome: CHROME_PATH, else the one Lighthouse finds.
cd "${0:A:h}"
H=${AUDIT_URL:-https://safrozen.local}
mkdir -p out/lh
for p in / /boutique/ /produit/legim-au-lalo/ /panier/ /mon-compte/ /suivi/ /recettes/ /recettes/mijote-de-lalo-aux-crevettes/ /contact/ /points-de-vente/ /notre-histoire/ /faq/; do
  n=$(echo $p | tr '/' '_'); [ "$n" = "_" ] && n=_home
  for f in mobile desktop; do
    extra=""; [ $f = desktop ] && extra="--preset=desktop"
    npx lighthouse "$H$p" $extra --quiet --chrome-flags="--headless=new --ignore-certificate-errors" --output=json --output=html --output-path=out/lh/$n.$f >/dev/null 2>&1 || echo "FAIL $p $f"
  done
done
echo DONE
