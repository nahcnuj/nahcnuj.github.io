BEGIN { RS=""; ORS="" } 
{ 
  gsub(/\\begin\{aligned\}/, "\\begin{align*}");
  gsub(/\\end\{aligned\}/, "\\end{align*}");
  gsub(/&\s*/, "");
  print;
}