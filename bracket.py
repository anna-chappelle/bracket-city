def find_innermost_brackets(s):
    result = []
    stack = []
    
    for i, char in enumerate(s):
        if char == '[':
            stack.append(i)
        elif char == ']':
            if stack:
                start = stack.pop()
                
                bracket_content = s[start+1:i]
                has_embedded_brackets = '[' in bracket_content
                
                if not has_embedded_brackets:
                    result.append(s[start:i+1])
    
    return result

def find_leaf_brackets_with_positions(s):
    result = []
    stack = []
    
    for i, char in enumerate(s):
        if char == '[':
            stack.append(i)
        elif char == ']':
            if stack:
                start = stack.pop()
                
                bracket_content = s[start+1:i]
                has_embedded_brackets = '[' in bracket_content
                
                if not has_embedded_brackets:
                    result.append((s[start:i+1], start, i+1))
    
    return result

def collapse_bracket_with_answer(s, bracket_text, answer):
    return s.replace(bracket_text, answer, 1)

def find_all_brackets_with_positions(s):
    result = []
    stack = []
    
    for i, char in enumerate(s):
        if char == '[':
            stack.append(i)
        elif char == ']':
            if stack:
                start = stack.pop()
                result.append((s[start:i+1], start, i+1))
    
    return result

def create_bracket_pattern_key(s):
    all_brackets = find_all_brackets_with_positions(s)
    key = {}
    
    print("Creating answer key for the puzzle...")
    print("Please provide the correct answers for each bracket:")
    print()
    
    bracket_levels = []
    for bracket, start, end in all_brackets:
        level = bracket.count('[') - 1
        bracket_levels.append((level, bracket, start, end))
    
    bracket_levels.sort()
    
    solved_brackets = {}
    
    for level, bracket, start, end in bracket_levels: 
        display_bracket = bracket
        
        sorted_solved = sorted(solved_brackets.items(), key=lambda x: len(x[0]), reverse=True)
        
        for solved_bracket, answer in sorted_solved:
            if solved_bracket in display_bracket:
                display_bracket = display_bracket.replace(solved_bracket, answer)
        
        print(f"Bracket (level {level}): {display_bracket}")
        answer = input(f"Enter correct answer for this bracket: ").strip()
        
        if answer:
            key[bracket] = answer.lower()
            key[display_bracket] = answer.lower()
            
            solved_brackets[bracket] = answer
        else:
            key[bracket] = ""
            key[display_bracket] = ""
        
        print()
    
    return key

def find_matching_answer(bracket, answer_key):
    if bracket in answer_key:
        return answer_key[bracket]
    
    bracket_content = bracket[1:-1]
    
    if '[' in bracket_content:
        for pattern, answer in answer_key.items():
            if pattern.startswith('[') and pattern.endswith(']'):
                pattern_content = pattern[1:-1]
                
                if (bracket_content.count('[') == pattern_content.count('[') and 
                    bracket_content.count(']') == pattern_content.count(']')):
                    return answer
                
                bracket_structure = bracket_content.replace('[', '[').replace(']', ']')
                pattern_structure = pattern_content.replace('[', '[').replace(']', ']')
                
                if bracket_structure.count('[') == pattern_structure.count('['):
                    return answer
    
    bracket_embedded_count = bracket_content.count('[')
    for pattern, answer in answer_key.items():
        if pattern.startswith('[') and pattern.endswith(']'):
            pattern_content = pattern[1:-1]
            if pattern_content.count('[') == bracket_embedded_count:
                return answer
    
    normalized_bracket = bracket
    for char in bracket_content:
        if char not in '[]':
            normalized_bracket = normalized_bracket.replace(char, '_')
    
    for pattern, answer in answer_key.items():
        if pattern.startswith('[') and pattern.endswith(']'):
            pattern_content = pattern[1:-1]
            normalized_pattern = pattern
            for char in pattern_content:
                if char not in '[]':
                    normalized_pattern = normalized_pattern.replace(char, '_')
            
            if normalized_bracket == normalized_pattern:
                return answer
    
    return ""

def validate_answer(user_answer, correct_answer):
    return user_answer.lower().strip() == correct_answer.lower().strip()

def interactive_bracket_solver_with_validation(s, answer_key=None, debug=False):
    current_string = s
    
    if answer_key is None:
        answer_key = create_bracket_pattern_key(s)
    
    if debug:
        print("DEBUG: Answer key:")
        for bracket, answer in answer_key.items():
            print(f"  {bracket} → {answer}")
        print()
    
    print(f"Original string: {current_string}")
    print()
    
    while True:
        if '[' not in current_string or ']' not in current_string:
            print("No more brackets in the string!")
            break
        
        leaf_brackets = find_leaf_brackets_with_positions(current_string)
        
        if not leaf_brackets:
            print("No more leaf brackets found!")
            break
        
        print("Current leaf brackets:")
        available_brackets = []
        for i, (bracket, start, end) in enumerate(leaf_brackets):
            matching_answer = find_matching_answer(bracket, answer_key)
            if matching_answer:
                print(f"{i+1}. {bracket}")
                available_brackets.append((i, bracket, matching_answer))
            else:
                print(f"{i+1}. {bracket} (no answer key)")
                if debug:
                    print(f"    DEBUG: Could not find match for {bracket}")
        
        if not available_brackets:
            print("No brackets with answer keys available!")
            print("Remaining brackets without keys:")
            for i, (bracket, start, end) in enumerate(leaf_brackets):
                print(f"  - {bracket}")
            break
        
        print(f"\nCurrent string: {current_string}")
        print()
        
        try:
            choice = input("Enter bracket number to solve (or 'q' to quit): ").strip()
            
            if choice.lower() == 'q':
                break
            elif choice.lower() == 'h':
                print("\nHints:")
                for i, bracket, answer in available_brackets:
                    if answer:
                        print(f"Bracket {i+1}: {bracket} → Answer length: {len(answer)} characters")
                    else:
                        print(f"Bracket {i+1}: {bracket} → No answer provided in key")
                print()
                continue
            
            bracket_index = int(choice) - 1
            if bracket_index < 0 or bracket_index >= len(available_brackets):
                print("Invalid bracket number!")
                continue
            
            selected_bracket = available_brackets[bracket_index][1]
            correct_answer = available_brackets[bracket_index][2]
            
            user_answer = input(f"Enter answer for {selected_bracket}: ").strip()
            
            if not user_answer:
                print("Answer cannot be empty!")
                continue
            
            if validate_answer(user_answer, correct_answer):
                current_string = collapse_bracket_with_answer(current_string, selected_bracket, user_answer)
                print(f"Correct! Updated string: {current_string}")
                print()
            else:
                print(f"Incorrect. Try again!")
                print()
                
        except ValueError:
            print("Please enter a valid number!")
        except KeyboardInterrupt:
            print("\nExiting...")
            break
    
    return current_string

if __name__ == "__main__":    
    demo_string = input("Enter the string to solve: ").strip()
    final_result = interactive_bracket_solver_with_validation(demo_string, debug=True)
    print(f"Final result: {final_result}")
