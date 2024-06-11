import sys

def main():
  if sys.argv[1] == 'bump':
    bump(sys.argv[2])

def bump(version: str):
  print(f'Bumping version: {version}')

if __name__ == '__main__':
  main()

