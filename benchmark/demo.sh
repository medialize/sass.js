git clone git@github.com:hcatlin/sass-spec.git
rm -rf sass-spec/spec/basic/{14_imports,33_ambiguous_imports}
cat sass-spec/spec/basic/*/*.scss > demo.scss
rm -rf sass-spec
