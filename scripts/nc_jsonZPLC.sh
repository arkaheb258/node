#!/bin/bash
if [ -z "$1" ] || [ -z "$2" ]; then
  echo 'brak parametrow! przyklad: ./*.sh /flash/json /tmp/json' >&2
  echo 'nazwa_skryptu.sh folder_plc folder_lokalny' >&2
  exit 1
else
  r_dir=$1
  l_dir=$2
  substring="."

  # rm $l_dir -r
  mkdir $l_dir
  cd $l_dir

  echo listowanie folderow
  ncftpls -t 5 -r 1 -u admin -p admin ftp://192.168.3.30/$r_dir/* > $l_dir/f_list.txt
  rc=$?; if [ $rc != 0 ]; then 
    echo listowanie nieudane $rc
    exit $rc; 
  fi

  echo kopiowanie zawartosci folderow
  #(tylko 1 poziom zaglebienia)
  while read p; do
    if [[ "$p" == *"$substring"* ]]; then
      rm $l_dir/$p
      echo pomijamy plik \"$p\"
    else
      echo Pobieranie folderu \"$p\"
      # rm $l_dir/$p -r
      mkdir $l_dir/$p
      cd $l_dir/$p
      ncftpget -r 1 -d stdout -u admin -p admin ftp://192.168.3.30/$r_dir/$p/*
      rc=$?; if [ $rc != 0 ]; then 
        echo kopiowanie nieudane $rc
        exit $rc
      fi
      # ncftpget -u admin -p admin ftp://192.168.3.30/$r_dir/$p/*
      cd ..
    fi  
  done < $l_dir/f_list.txt
  #rm $l_dir/f_list.txt
  echo kopiowanie plikow z folderu nadrzednego
  ncftpget -r 1 -d stdout -u admin -p admin ftp://192.168.3.30/$r_dir/*
  rc=$?; if [ $rc != 0 ]; then 
    echo kopiowanie nieudane $rc
    exit $rc
  fi
  exit 0
fi
