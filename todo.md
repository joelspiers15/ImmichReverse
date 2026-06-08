# Remaining bugs

1. Back side doesn't render on initial page load. Requires toggling between pictures. Likely needs to wait for injection point to load then call run()
2. Images without back side text will keep the last displayed backside text. Needs to be cleared when moving to an image without a backside

# Other

1. Fill out read me with more information
2. Organize better. IIUC it must all be one file for tampermonkey, but surely it could be structured in a more easy to read way.