import { prompt } from '../src/prompt';

describe('rename as section', () => {
  it('should work if you rename it', () => {

    const p = prompt();
    const result = p`If you don't like the the parenthesis you can rename it and use it as a cleaner tag`
    expect(result).toContain('If you don\'t like the the parenthesis you can rename it and use it as a cleaner tag');
  });

  it('should work if you like the section format', () => {

    const section = prompt;
    const p = section(); 
    const result = p`Some people might like to use a simpler tag, and then use another tag called section to specifiy sections of a prompt:
    
    ${section('Section 1')`Here is the content for section 1`}

    ${section('Section 2', false)`Section 2 here won't be shown as the conditional is false`}

    You know, whetever you like.     Just sharing some examples.
    `
    expect(result).toContain('Some people might like to use a simpler tag, and then use another tag called section to specifiy sections of a prompt:');
    expect(result).toContain('==== Section 1 ====');
    expect(result).toContain('Here is the content for section 1');
    expect(result).toContain('==== End of Section 1 ====');
    expect(result).not.toContain('==== Section 2 ====');
    expect(result).not.toContain('Section 2 here won\'t be shown as the conditional is false');
    expect(result).not.toContain('==== End of Section 2 ====');
    expect(result).toContain('You know, whetever you like. Just sharing some examples.');
  });
}); 