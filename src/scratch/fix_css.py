import sys

def replace_block(file_path, start_marker, end_marker, new_content):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    start_idx = -1
    end_idx = -1
    
    for i, line in enumerate(lines):
        if start_marker in line and start_idx == -1:
            start_idx = i
        if end_marker in line and start_idx != -1:
            end_idx = i
            break
            
    if start_idx != -1 and end_idx != -1:
        # Keep leading whitespace of the first line if possible
        leading_ws = lines[start_idx][:lines[start_idx].find(start_marker)]
        new_lines = [leading_ws + l + '\n' for l in new_content.split('\n')]
        lines[start_idx:end_idx+1] = new_lines
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print(f"Successfully replaced block from {start_idx} to {end_idx}")
    else:
        print(f"Failed to find markers: {start_marker}, {end_marker}")
        sys.exit(1)

if __name__ == "__main__":
    file_path = sys.argv[1]
    start_marker = sys.argv[2]
    end_marker = sys.argv[3]
    new_content_file = sys.argv[4]
    
    with open(new_content_file, 'r', encoding='utf-8') as f:
        new_content = f.read()
        
    replace_block(file_path, start_marker, end_marker, new_content)
